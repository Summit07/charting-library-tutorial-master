// Makes requests to CryptoCompare API
async function makeApiRequest(path) {
	try {
		const response = await fetch(`https://min-api.cryptocompare.com/${path}`);
		console.log(response)
		return response.json();
	} catch (error) {
		throw new Error(`CryptoCompare request error: ${error.status}`);
	}
}

// Generates a symbol ID from a pair of the coins
function generateSymbol(exchange, fromSymbol, toSymbol) {
	const short = `${fromSymbol}/${toSymbol}`;
	// console.log("generateSymbol", short, `${exchange}:${short}`)
	return {
		short,
		full: `${exchange}:${short}`,
	};
}

// Returns all parts of the symbol
function parseFullSymbol(fullSymbol) {
	const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/);
	console.log("parseFullSymbol", match)
	if (!match) {
		return null;
	}

	return {
		exchange: match[1],
		fromSymbol: match[2],
		toSymbol: match[3],
	};
}
// parseFullSymbol("BTCTurk:SHIB/USDT")

// parseFullSymbol [
// 	'BTCTurk:SHIB/USDT',
// 	'BTCTurk',
// 	'SHIB',
// 	'USDT',
// 	index: 0,
// 	input: 'BTCTurk:SHIB/USDT',
// 	groups: undefined
//   ]
module.exports = {
	generateSymbol,
	parseFullSymbol
}
