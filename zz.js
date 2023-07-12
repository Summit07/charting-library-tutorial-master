// const urlParameters = {
//     e: 'BigONE:BTC/USDT', fsym: 'BigONE', tsym: 'BTC', toTs: "to", limit: 2000,
// };
// const query = Object.keys(urlParameters)
//     .map(name => `${name}=${encodeURIComponent(urlParameters[name])}`)
//     .join('&');
// console.log(query);
var myHeaders = new Headers();
//e=BTCTurk%3ASHIB%2FUSDT&fsym=BTCTurk&tsym=SHIB&toTs=to&limit=2000
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

const getResult = async () => {
    const data = await getBarsData().then(r => r);
    // console.log(data)

    let bars = [];
    data.forEach(bar => {
        if (bar.time >= 1672556376000 && bar.time < 1688194776000) {
            console.log(bar, true)
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
}

getResult()
