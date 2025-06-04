document.getElementById('openConverterBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('converter.html') });
});
