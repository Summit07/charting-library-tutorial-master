// import { makeApiRequest, generateSymbol, parseFullSymbol, } from './helpers.js';
// import { subscribeOnStream, unsubscribeFromStream, } from './streaming.js';
const { generateSymbol, parseFullSymbol } = require("./helpers")
var myHeaders = new Headers();
const lastBarsCache = new Map();
var symbolInfo = {
	ticker: 'BigBank:SHIB/USDT',
	name: 'SHIB/USDT',
	description: 'SHIB/USDT',
	type: 'crypto',
	session: '24x7',
	timezone: 'Etc/UTC',
	exchange: 'BigBank',
	minmov: 1,
	pricescale: 100,
	has_intraday: false,
	has_no_volume: true,
	has_weekly_and_monthly: false,
	supported_resolutions: ['1D', '1W', '1M'],
	volume_precision: 2,
	data_status: 'streaming'
}
// DatafeedConfiguration implementation
const configurationData = {
	// Represents the resolutions for bars supported by your datafeed
	supported_resolutions: ['1D', '1W', '1M'],

	// The `exchanges` arguments are used for the `searchSymbols` method if a user selects the exchange
	exchanges: [
		{
			value: 'Bitfinex',
			name: 'Bitfinex',
			desc: 'Bitfinex',
		},
		{
			value: 'Kraken',
			// Filter name
			name: 'Kraken',
			// Full exchange name displayed in the filter popup
			desc: 'Kraken bitcoin exchange',
		},
	],
	// The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
	symbols_types: [
		{
			name: 'crypto',
			value: 'crypto',
		},
	],
};
// Obtains all symbols for all exchanges supported by CryptoCompare API
async function getAllSymbols() {
	const data = await makeApiRequest('data/v3/all/exchanges'); //https://min-api.cryptocompare.com/data/v3/all/exchanges
	let allSymbols = [];

	for (const exchange of configurationData.exchanges) {
		const pairs = data.Data[exchange.value].pairs;

		for (const leftPairPart of Object.keys(pairs)) {
			const symbols = pairs[leftPairPart].map(rightPairPart => {
				const symbol = generateSymbol(exchange.value, leftPairPart, rightPairPart);
				return {
					symbol: symbol.short,
					full_name: symbol.full,
					description: symbol.short,
					exchange: exchange.value,
					type: 'crypto',
				};
			});
			allSymbols = [...allSymbols, ...symbols];
		}
	}
	return allSymbols;
}

const configurationDatas = {
	// Represents the resolutions for bars supported by your datafeed
	supported_resolutions: ['1D', '1W', '1M'],

	// The `exchanges` arguments are used for the `searchSymbols` method if a user selects the exchange
	exchanges: [
		{
			value: 'BigBank',
			name: 'BigBank',
			desc: 'BigBank Exchange',
		},
	],
	// The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
	symbols_types: [
		{
			name: 'crypto',
			value: 'crypto',
		},
	],
};

async function getPairsData(base) {
	return new Promise(async (res, rej) => {
		myHeaders.append("Cookie", "connect.sid=s%3AC23OlwbQkJotNcDgXNDJRPkHJP7Jrx9H.rt2v3ep%2Ftzvh8lMhqJHMzwHUg9ZpzhkoyyuEeHYvRIY");

		var requestOptions = {
			method: 'POST',
			headers: myHeaders,
			redirect: 'follow'
		};

		await fetch(`http://localhost:3000/api/getQueryCoinList?base=${base}`, requestOptions)
			.then(response => response.json())
			.then(result => {
				// console.log(result.length)
				res(result)
			})
			.catch(error => rej('error', error));
	})

}

async function getBarsData() {
	return new Promise(async (res, rej) => {
		myHeaders.append("Cookie", "connect.sid=s%3AC23OlwbQkJotNcDgXNDJRPkHJP7Jrx9H.rt2v3ep%2Ftzvh8lMhqJHMzwHUg9ZpzhkoyyuEeHYvRIY");

		var requestOptions = {
			method: 'GET',
			headers: myHeaders,
			redirect: 'follow'
		};

		await fetch("http://localhost:3000/api/getBarsData", requestOptions)
			.then(response => response.json())
			.then(result => {
				res(result)
			})
			.catch(error => console.log('error', error));
	})
}

async function getMyAllSymbols() {
	let data = await getPairsData("usdt").then(r => r); //https://min-api.cryptocompare.com/data/v3/all/exchanges
	let allSymbols = [];
	// console.log(data)

	const symbols = data.map((coin) => {
		const symbol = generateSymbol(configurationDatas.exchanges[0].value, coin.targetsybl, coin.basesybl);
		// console.log(symbol)
		return {
			symbol: symbol.short,
			full_name: symbol.full,
			description: symbol.short,
			exchange: configurationDatas.exchanges[0].value,
			type: 'crypto',
		};
	});

	allSymbols = [...allSymbols, ...symbols];
	if (allSymbols.length == data.length) {
		// console.log(allSymbols)
		return allSymbols;
	}
	// console.log(allSymbols)
	// return allSymbols;
}

// getMyAllSymbols()

const onReady = async (callback) => {
	console.log('[onReady]: Method call');
	setTimeout(() => callback(configurationDatas));
}

const searchSymbols = async (
	userInput,
	exchange,
	symbolType,
	onResultReadyCallback,
) => {
	console.log('[searchSymbols]: Method call');
	const symbols = await getMyAllSymbols();
	const newSymbols = symbols.filter(symbol => {
		const isExchangeValid = exchange === '' || symbol.exchange === exchange;
		const isFullSymbolContainsInput = symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !== -1;
		console.log(isFullSymbolContainsInput)
		return isExchangeValid && isFullSymbolContainsInput;
	});
	onResultReadyCallback(newSymbols);
}

// searchSymbols("USDT", "BigBank", "TRX", () => "Noting") // output:true

const resolveSymbol = async (
	symbolName,
	onSymbolResolvedCallback,
	onResolveErrorCallback,
	extension
) => {
	console.log('[resolveSymbol]: Method call', symbolName);
	const symbols = await getMyAllSymbols();
	const symbolItem = symbols.find(({ full_name, }) => full_name === symbolName);
	if (!symbolItem) {
		console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
		onResolveErrorCallback('cannot resolve symbol');
		return;
	}
	// Symbol information object
	symbolInfo = {
		ticker: symbolItem.full_name,
		name: symbolItem.symbol,
		description: symbolItem.description,
		type: symbolItem.type,
		session: '24x7',
		timezone: 'Etc/UTC',
		exchange: symbolItem.exchange,
		minmov: 1,
		pricescale: 100,
		has_intraday: false,
		has_no_volume: true,
		has_weekly_and_monthly: false,
		supported_resolutions: configurationData.supported_resolutions,
		volume_precision: 2,
		data_status: 'streaming',
	};

	console.log('[resolveSymbol]: Symbol resolved', symbolName, "symbolInfo", symbolInfo);
	onSymbolResolvedCallback(symbolInfo);
}

resolveSymbol("BigBank:SHIB/USDT", () => "Noting", () => "Noting", "Noting") //resolve

const getBars = async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
	// const { from, to, firstDataRequest } = periodParams;
	let from = "1672556376000";
	let to = "1688194776000";
	let firstDataRequest = "1672556376000";

	console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
	// const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
	const parsedSymbol = parseFullSymbol("BigBank:BTC/USDT");
	// const urlParameters = {
	// 	e: parsedSymbol.exchange,
	// 	fsym: parsedSymbol.fromSymbol,
	// 	tsym: parsedSymbol.toSymbol,
	// 	toTs: to,
	// 	limit: 2000,
	// };
	//{ e:'BTCTurk:SHIB/USDT',fsym:'BTCTurk',tsym:'SHIB',toTs: to,limit: 2000,}
	const urlParameters = {
		e: 'BTCTurk:SHIB/USDT', fsym: 'BTCTurk', tsym: 'SHIB', toTs: to, limit: 2000,
	};
	const query = Object.keys(urlParameters)
		.map(name => `${name}=${encodeURIComponent(urlParameters[name])}`)
		.join('&');

	// console.log(query);

	try {
		// const datas = await makeApiRequest(`data/histoday?${query}`);
		const data = await getBarsData().then(r => r);
		console.log(data)
		if (!data || data.Data.length === 0) {
			// "noData" should be set if there is no data in the requested period
			onHistoryCallback([], {
				noData: true,
			});
			return;
		}
		let bars = [];
		data.forEach(bar => {
			if (bar.time >= 1672556376000 && bar.time < 1688194776000) {
				// console.log(bar, true)
				bars = [...bars, {
					time: bar.time * 1000,
					low: bar.low,
					high: bar.high,
					open: bar.open,
					close: bar.close,
				}];
			} else {
				console.log(false)
			}
		});
		if (firstDataRequest) {
			lastBarsCache.set(symbolInfo.full_name, {
				...bars[bars.length - 1],
			});
		}
		console.log(`[getBars]: returned ${bars.length} bar(s)`);
		onHistoryCallback(bars, {
			noData: false,
		});
	} catch (error) {
		console.log('[getBars]: Get error', error);
		onErrorCallback(error);
	}
}

// getBars(symbolInfo, "resolution", "periodParams", () => "noneHis", () => "Error")

const subscribeBars = async (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback,) => {

	console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID);

	subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback, lastBarsCache.get(symbolInfo.full_name),);
}

const unsubscribeBars = (subscriberUID) => {
	console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
	unsubscribeFromStream(subscriberUID);
}

// export default {

// 	onReady: (callback) => {
// 		console.log('[onReady]: Method call');
// 		setTimeout(() => callback(configurationDatas));
// 	},

// 	searchSymbols: async (
// 		userInput,
// 		exchange,
// 		symbolType,
// 		onResultReadyCallback,
// 	) => {
// 		console.log('[searchSymbols]: Method call');
// 		const symbols = await getMyAllSymbols();
// 		const newSymbols = symbols.filter(symbol => {
// 			const isExchangeValid = exchange === '' || symbol.exchange === exchange;
// 			const isFullSymbolContainsInput = symbol.full_name
// 				.toLowerCase()
// 				.indexOf(userInput.toLowerCase()) !== -1;
// 			return isExchangeValid && isFullSymbolContainsInput;
// 		});
// 		onResultReadyCallback(newSymbols);
// 	},

// 	resolveSymbol: async (
// 		symbolName,
// 		onSymbolResolvedCallback,
// 		onResolveErrorCallback,
// 		extension
// 	) => {
// 		console.log('[resolveSymbol]: Method call', symbolName);
// 		const symbols = await getMyAllSymbols();
// 		const symbolItem = symbols.find(({
// 			full_name,
// 		}) => full_name === symbolName);
// 		if (!symbolItem) {
// 			console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
// 			onResolveErrorCallback('cannot resolve symbol');
// 			return;
// 		}
// 		// Symbol information object
// 		const symbolInfo = {
// 			ticker: symbolItem.full_name,
// 			name: symbolItem.symbol,
// 			description: symbolItem.description,
// 			type: symbolItem.type,
// 			session: '24x7',
// 			timezone: 'Etc/UTC',
// 			exchange: symbolItem.exchange,
// 			minmov: 1,
// 			pricescale: 100,
// 			has_intraday: false,
// 			has_no_volume: true,
// 			has_weekly_and_monthly: false,
// 			supported_resolutions: configurationData.supported_resolutions,
// 			volume_precision: 2,
// 			data_status: 'streaming',
// 		};

// 		console.log('[resolveSymbol]: Symbol resolved', symbolName);
// 		onSymbolResolvedCallback(symbolInfo);
// 	},

// 	getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
// 		const { from, to, firstDataRequest } = periodParams;
// 		console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
// 		const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
// 		const urlParameters = {
// 			e: parsedSymbol.exchange,
// 			fsym: parsedSymbol.fromSymbol,
// 			tsym: parsedSymbol.toSymbol,
// 			toTs: to,
// 			limit: 2000,
// 		};
// 		const query = Object.keys(urlParameters)
// 			.map(name => `${name}=${encodeURIComponent(urlParameters[name])}`)
// 			.join('&');
// 		console.log(query);
// 		// try {
// 		// 	const data = await makeApiRequest(`data/histoday?${query}`);
// 		// 	if (data.Response && data.Response === 'Error' || data.Data.length === 0) {
// 		// 		// "noData" should be set if there is no data in the requested period
// 		// 		onHistoryCallback([], {
// 		// 			noData: true,
// 		// 		});
// 		// 		return;
// 		// 	}
// 		// 	let bars = [];
// 		// 	data.Data.forEach(bar => {
// 		// 		if (bar.time >= from && bar.time < to) {
// 		// 			bars = [...bars, {
// 		// 				time: bar.time * 1000,
// 		// 				low: bar.low,
// 		// 				high: bar.high,
// 		// 				open: bar.open,
// 		// 				close: bar.close,
// 		// 			}];
// 		// 		}
// 		// 	});
// 		// 	if (firstDataRequest) {
// 		// 		lastBarsCache.set(symbolInfo.full_name, {
// 		// 			...bars[bars.length - 1],
// 		// 		});
// 		// 	}
// 		// 	console.log(`[getBars]: returned ${bars.length} bar(s)`);
// 		// 	onHistoryCallback(bars, {
// 		// 		noData: false,
// 		// 	});
// 		// } catch (error) {
// 		// 	console.log('[getBars]: Get error', error);
// 		// 	onErrorCallback(error);
// 		// }
// 	},



// 	// subscribeBars: (
// 	// 	symbolInfo,
// 	// 	resolution,
// 	// 	onRealtimeCallback,
// 	// 	subscriberUID,
// 	// 	onResetCacheNeededCallback,
// 	// ) => {
// 	// 	console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID);
// 	// 	subscribeOnStream(
// 	// 		symbolInfo,
// 	// 		resolution,
// 	// 		onRealtimeCallback,
// 	// 		subscriberUID,
// 	// 		onResetCacheNeededCallback,
// 	// 		lastBarsCache.get(symbolInfo.full_name),
// 	// 	);
// 	// },

// 	// unsubscribeBars: (subscriberUID) => {
// 	// 	console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
// 	// 	unsubscribeFromStream(subscriberUID);
// 	// },
// };

// console.log(getBars())


module.exports = {
	onReady,
	searchSymbols,
	resolveSymbol,
	getBars,
	subscribeBars,
	unsubscribeBars,
}
