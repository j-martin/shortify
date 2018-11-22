chrome.extension.onRequest.addListener((request, sender, sendResponse) => {

  let workspace = getWithDefault('workspace');
  let urlPatterns = getUrlPatterns();
  let ignoredElements = getWithDefault('ignoredElements');
  let newWindow = getWithDefault('newWindow', 'false');
  if (!matchesAnyUrlPatterns(sender.tab.url, urlPatterns)) {
    sendResponse({
      enabled: false
    });
    return;
  }
  if (request.method === "getClubifySettings") {
    sendResponse({
      enabled: true,
      workspace,
      urlPatterns,
      ignoredElements,
      newWindow,
    });
  } else {
    sendResponse({
      enabled: false
    });
  }
});

const getUrlPatterns = () => getWithDefault('urlPatterns', 'git,ci');

const getWithDefault = (field, defaultValue) => {
  let value = localStorage.getItem(field);
  if (!value && defaultValue) {
    value = defaultValue;
    localStorage.setItem(field, value);
  }
  return value;
};

// Called when the url of a tab changes.
const checkForValidUrl = (tabId, changeInfo, tab) => {
  if (matchesAnyUrlPatterns(tab.url, getUrlPatterns())) {
    chrome.pageAction.show(tabId);
    return;
  }
  chrome.pageAction.hide(tabId);
};

// Check to see if the url should have its content clubified.
const matchesAnyUrlPatterns = (url, urlPatterns) => {
  if (!urlPatterns) {
    return false;
  }
  const urls = urlPatterns.split(",");
  for (let c = 0; c < urls.length; c++) {
    if (url.indexOf(urls[c]) !== -1) {
      return true;
    }
  }
  return false;
};

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);

// When the page action is clicked, go to the config page.
chrome.pageAction.onClicked.addListener(() => {
  chrome.tabs.create({ "url": "clubify-config.html" });
});
