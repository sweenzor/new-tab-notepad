// The notepad lives on the new tab page, so the toolbar icon just opens one.
chrome.action.onClicked.addListener(function() {
  chrome.tabs.create({});
});
