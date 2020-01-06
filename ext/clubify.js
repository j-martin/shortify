/*
 * Global Variables
 */
let ignoredElements = [];
let baseUrl;
let pageChangedByAjaxTimer;
let targetWindow;

/*
 * Extension Settings
 */
chrome.extension.sendRequest({ method: "getClubifySettings" }, res => {
  if (!res.enabled) {
    return;
  }
  if (res.ignoredElements) {
    ignoredElements = res.ignoredElements.split(",");
  }

  const segment = res.workspace ? `${res.workspace}/` : "";
  baseUrl = `https://app.clubhouse.io/${segment}story`;
  targetWindow = res.newWindow;
  window.addEventListener("load", loadAjaxPage, false);

  //kick once to handle pages without AJAX
  nodeInsertDetected(null);
});

/*
 * Methods related to AJAX Events
 */
const loadAjaxPage = () => {
  if (pageChangedByAjaxTimer) {
    clearTimeout(pageChangedByAjaxTimer);
    pageChangedByAjaxTimer = "";
  }
  //throttle DOMNodeInserted processing
  addDebouncedEventListener(
    document,
    "DOMNodeInserted",
    nodeInsertDetected,
    1000
  );
};

const nodeInsertDetected = event => {
  if (pageChangedByAjaxTimer) {
    clearTimeout(pageChangedByAjaxTimer);
    pageChangedByAjaxTimer = "";
  }
  pageChangedByAjaxTimer = setTimeout(handlePageChange, 500);
};

const handlePageChange = () => {
  removeEventListener("DOMNodeInserted", nodeInsertDetected, false);
  replaceStoryIdsWithLinks(targetWindow, ignoredElements);
};

const addDebouncedEventListener = (obj, eventType, listener, delay) => {
  let timer;

  obj.addEventListener(
    eventType,
    evt => {
      if (timer) {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(() => {
        timer = null;
        listener.call(obj, evt);
      }, delay);
    },
    false
  );
};

/*
 * Methods to convert the text to URLS
 */
const replaceStoryIdsWithLinks = (newWindow, ignoredElements, startNode) => {
  const ignore = ["a", "textarea", "svg"].concat(ignoredElements);

  startNode = startNode ? startNode : document.getElementsByTagName("body")[0];

  getMatches(
    startNode,
    /\[?ch(\d+)\]?/gi,
    (all, story) => {
      const clubhouseLink = document.createElement("a");

      clubhouseLink.href = `${baseUrl}/${story}`;
      clubhouseLink.textContent = all;

      if (newWindow === "true") {
        clubhouseLink.target = "_blank";
      }

      return clubhouseLink;
    },
    ignore
  );
};

const getMatches = (parent, regex, callback, ignore) => {
  let node = parent.firstChild;

  if (node === null) return parent;

  do {
    switch (node.nodeType) {
      case 1:
        if (ignore.indexOf(node.tagName.toLowerCase()) > -1) {
          continue;
        }

        getMatches(node, regex, callback, ignore);
        break;

      case 3:
        const match = regex.exec(node.data);
        if (match) {
          const newNode = callback.apply(window, match);
          if (newNode) {
            const newText = node.splitText(match.index);
            node.parentNode.insertBefore(newNode, newText);
            newText.data = newText.data.slice(match[0].length);
            regex.lastIndex = 0;
            node = newText;
          }
        }
        break;
    }
  } while ((node = node.nextSibling));

  return parent;
};
