const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
 
async function main() {
	const chrome = await chromeLauncher.launch({
	chromeFlags: [

	  '--window-size=1200,800',

	  '--user-data-dir=/tmp/chrome-testing',

	  '--auto-open-devtools-for-tabs'

	]
	});
	// To use the CDP, you need to connect to the debugger port and, because we’re using the chrome-launcher library, this is conveniently accessible via chrome.port.
	const protocol = await CDP({ port: chrome.port });
	// Many of the domains in the protocol need to be enabled first, and we’re going to start with the Runtime domain so that we can hook into the console API and deliver any console calls in the browser to the command line.
	// Cool es6 this below declaration is the same thing as var Runtime = protocol["Runtime"]
	const { Runtime, Network } = protocol;
	// Wait for the runtime.enable to rexolve
	// Now when you run your script, you get a fully functional Chrome window that also outputs all of its console messages to your terminal. That’s awesome on its own, especially for testing purposes!
	await Promise.all([Runtime.enable(),Network.enable()]);
	// ES6 SHIT calling a function with {args,type} is basically calling the properties of the objet passed in..ie function(obj[arg],obj[type]).  
	Runtime.consoleAPICalled(function({args, type}){
	   eval(require('locus'))
	   console[type].apply(console, args.map(a => a.value))
	});
	// Set the patterns you want to intercept
	await Network.setRequestInterception({
		patterns: [
			{
				urlPattern: '*.js*',
				resourceType: 'Script',
				interceptionStage: 'HeadersReceived'
    		}
 
  		] 
  	});
	// handle the intercepted request and continue loading as normal.
	Network.requestIntercepted(async function({ interceptionId, request}){
		console.log(`Intercepted ${request.url} {interception id: ${interceptionId}}`);
		Network.continueInterceptedRequest({interceptionId});

	}) 
	 
	 



}
 

 
main()