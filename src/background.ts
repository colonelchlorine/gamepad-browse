// Fired when the extension is first installed, 
// when the extension is updated to a new version, 
// and when Chrome is updated to a new version.
import { MessageRequestAction } from "./utils";

chrome.runtime.onInstalled.addListener(init);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(sender.tab ?
				"from a content script:" + sender.tab.url :
				"from the extension");
	
	handleRequest(request).then((msg) => {
		sendResponse(msg);
	});
	return true;
});

function init(details) {
	if (details.reason == "install") {
		chrome.tabs.query({}, function (tabs) {
			tabs.forEach(addGamepadToTab);
		});
	}
}

function addGamepadToTab(tab) {
	chrome.tabs.executeScript(tab.id, {
		file: "gamepad.js",
		allFrames: true
	});
}

function handleRequest(request): Promise<string> {
	
	return new Promise<string>((resolve, reject) => {
		console.log(request.action, "ACTION??");
		switch (request.action) {
			case MessageRequestAction.TabSwitch:
				if (request.data && request.data.move == "next") {
					chrome.windows.getLastFocused({ populate: true }, (window) => {
						var foundSelected = false;
						for (var i = 0; i < window.tabs.length; i++)
						{
							// Finding the selected tab.
							if (window.tabs[i].active)
							{
								foundSelected = true;
							}
							// Finding the next tab.
							else if (foundSelected)
							{
								// Selecting the next tab.
								chrome.tabs.update(window.tabs[i].id, {active: true});
								resolve("Next tab!");
								return;
							}
						}
						reject("Next tab broke");
					});
				} else if (request.data && request.data.move == "prev") {
					chrome.windows.getLastFocused({ populate: true }, (window) => {
						var foundSelected = false;
						for (var i = window.tabs.length - 1; i >= 0; i--)
						{
							// Finding the selected tab.
							if (window.tabs[i].active)
							{
								foundSelected = true;
							}
							// Finding the next tab.
							else if (foundSelected)
							{
								// Selecting the next tab.
								chrome.tabs.update(window.tabs[i].id, {active: true});
								resolve("Prev tab!");
								return;
							}
							reject("Prev tab broke");
						}
					});
				}
				reject("Data not right");
				break;
			default:
				reject("Didn't match action");	
				break;	
		}
	});
}