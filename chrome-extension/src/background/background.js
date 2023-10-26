const extractFileIdAndNodeId = /https:\/\/(www\.)?figma\.com\/file\/([^/]+?)\/.*node-id=([^&]+)/;

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

async function contentCopy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return {
      err: null
    }
  } catch (err) {
    return {
      err
    }
  }
}

function copyToClipboard(textToCopy, tabId) {
  chrome.scripting.executeScript({
    target: {tabId},
    func: contentCopy,
    args: [textToCopy],
  }).then(injectionResults => {
    if (injectionResults[0].result.err) {
      console.error('Failed to copy url to the clipboard: ' + JSON.stringify(injectionResults[0].result.err));
      sendNotification('Error', 'Failed to copy the url to your clipboard');
    } else {
      sendNotification('Success', 'The markdown code has been copied to your clipboard');
    }
  });
}

chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes('https://www.figma.com/file/') || tab.url.includes('https://figma.com/file/')) {
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
        copyToClipboard(markdown, tab.id);
      })
  }
});
