// Fired when the extension is first installed, 
// when the extension is updated to a new version, 
// and when Chrome is updated to a new version.

chrome.runtime.onInstalled.addListener(init);

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