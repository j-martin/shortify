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
chrome.extension.sendRequest({ method: 'getClubifySettings' }, res => {
  if (!res.enabled) {
    return;
  }
  if (res.ignoredElements) {
    ignoredElements = res.ignoredElements.split(',');
  }

  const segment = res.workspace ? `${res.workspace}/` : '';
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
    pageChangedByAjaxTimer = '';
  }
  //throttle DOMNodeInserted processing
  addDebouncedEventListener(document, 'DOMNodeInserted', nodeInsertDetected, 1000);
};

const nodeInsertDetected = event => {
  if (pageChangedByAjaxTimer) {
    clearTimeout(pageChangedByAjaxTimer);
    pageChangedByAjaxTimer = '';
  }
  pageChangedByAjaxTimer = setTimeout(handlePageChange, 500);
};

const handlePageChange = () => {
  removeEventListener('DOMNodeInserted', nodeInsertDetected, false);
  replaceStoryIdsWithLinks(targetWindow, ignoredElements);
};

const addDebouncedEventListener = (obj, eventType, listener, delay) => {
  let timer;

  obj.addEventListener(eventType, evt => {
    if (timer) {
      window.clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      timer = null;
      listener.call(obj, evt);
    }, delay);
  }, false);
};

/*
 * Methods to convert the text to URLS
 */
const replaceStoryIdsWithLinks = (newWindow, ignoredElements, startNode) => {
  const regex = getRegex(),
    ignore = ['a', 'textarea'].concat(ignoredElements);

  startNode = (startNode) ? startNode : document.getElementsByTagName('body')[0];

  getMatches(startNode, regex, (node, story) => {
    const clubhouseLink = document.createElement('a');

    clubhouseLink.href = `${baseUrl}/${story.replace('ch', '')}`;
    clubhouseLink.textContent = story;

    if (newWindow === 'true') {
      clubhouseLink.target = '_blank';
    }

    node.parentNode.insertBefore(clubhouseLink, node.nextSibling);
  }, ignore);
};

const getRegex = () => new RegExp(/ch(\d+)/, 'g');

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
        node.data.replace(regex, function (all) {
          // If this one has a browse prefix: don't replace anything.
          const args = [].slice.call(arguments),
            //if two are found in the same node we need to use the new offset for all except the first
            offset = (node.data.indexOf(all) >= 0) ? node.data.indexOf(all) : args[args.length - 2],
            newNode = node.splitText(offset);

          newNode.data = newNode.data.substr(all.length);

          callback.apply(window, [node].concat(args));

          node = newNode;

        });
        break;
    }
  } while (node = node.nextSibling);

  return parent;
};
