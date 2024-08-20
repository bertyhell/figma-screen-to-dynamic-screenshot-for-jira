const extractFileIdAndNodeId = /https:\/\/(www\.)?figma\.com\/design\/([^/]+?)\/.*node-id=([^&]+)/;

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function sendNotification(title, message) {
  chrome.notifications.create(uuidv4(), {
    type: 'basic',
    iconUrl: '/icons/icon48.png',
    title,
    message,
    priority: 2
  })
}

async function addToClipboard(value) {
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: [chrome.offscreen.Reason.CLIPBOARD],
    justification: 'Write text to the clipboard.'
  });

  // Now that we have an offscreen document, we can dispatch the
  // message.
  chrome.runtime.sendMessage({
    type: 'copy-data-to-clipboard',
    target: 'offscreen-doc',
    data: value
  });
}

chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes('https://www.figma.com/design/') || tab.url.includes('https://figma.com/design/')) {
    const matches = extractFileIdAndNodeId.exec(tab.url);
    const fileKey = matches[2];
    const nodeId = matches[3];

    if (!fileKey || !nodeId) {
      const error = 'No file key and node id could be found in the url. Make sure you select a screen in figma first. Url should look like: figma.com/file/<fileKey>/<title>?node-id=<nodeId></title>'
      console.error(error);
      sendNotification('Error', error);
      return;
    }

    chrome.storage.local.get(
      {serverUrl: "", includeFigmaScreenLink: false},
      async (options) => {
        if (!options.serverUrl) {
          const error = 'No serverUrl was set in the options of the extension. Right click the extension and set a server url in the options page.';
          console.error(error);
          sendNotification('Error', error);
          return;
        }

        const thumbnailUrl = options.serverUrl + '/' + fileKey + '/' + nodeId;
        let markdown = `![figma screen](${thumbnailUrl})`;
        if (options.includeFigmaScreenLink) {
          markdown += '\n' + tab.url;
        }
        addToClipboard(markdown);
      })
  }
});
