chrome.extension.onRequest.addListener((request, sender, sendResponse) => {
  let workspace = getWithDefault("workspace");
  let urlPatterns = getUrlPatterns();
  let ignoredElements = getWithDefault("ignoredElements");
  let newWindow = getWithDefault("newWindow", "false");
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
      newWindow
    });
  } else {
    sendResponse({
      enabled: false
    });
  }
});

const getUrlPatterns = () => getWithDefault("urlPatterns", "git,ci");

const getWithDefault = (field, defaultValue) => {
  let value = localStorage.getItem(field);
  if (!value && defaultValue) {
    value = defaultValue;
    localStorage.setItem(field, value);
  }
  return value;
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

// When the page action is clicked, go to the config page.
chrome.pageAction.onClicked.addListener(() => {
  chrome.tabs.create({ url: "clubify-config.html" });
});
