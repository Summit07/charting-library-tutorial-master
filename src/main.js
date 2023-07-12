// Datafeed implementation
import Datafeed from './datafeed.js';

// window.tvWidget = new TradingView.widget(
// 	{
// 		symbol: 'BigBank:BTC/USDT',             // Default symbol
// 		interval: '1D',                         // Default interval
// 		fullscreen: true,                       // Displays the chart in the fullscreen mode
// 		container: 'tv_chart_container',        // Reference to an attribute of the DOM element
// 		datafeed: Datafeed,
// 		library_path: '../charting_library_cloned_data/charting_library/',
// 	});
window.tvWidget = new TradingView.widget(
	{
		"width": 980,
		"height": 610,
		"symbol": "NASDAQ:AAPL",
		"interval": "D",
		"timezone": "Asia/Kolkata",
		"theme": "dark",
		"style": "1",
		"locale": "en",
		"toolbar_bg": "#f1f3f6",
		"enable_publishing": true,
		"withdateranges": true,
		"hide_side_toolbar": false,
		"allow_symbol_change": true,
		"details": true,
		"hotlist": true,
		"calendar": true,
		"container_id": "tradingview_38990"
	});
