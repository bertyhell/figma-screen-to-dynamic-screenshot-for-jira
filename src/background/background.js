const extractFileIdAndNodeId = /https:\/\/(www\.)?figma\.com\/file\/([^/]+?)\/[^?]+\?node-id=([^&]+)/;

async function contentCopy(text) {
	try {
		console.log('copying ' + text + ' to the clipboard');
		await navigator.clipboard.writeText(text);
		console.log('copied ' + text + ' to the clipboard');
	} catch (err) {
		console.error('Failed to copy url to the clipboard: ' + JSON.stringify(err));
	}
}

function copyToClipboard(textToCopy, tabId) {
	chrome.scripting.executeScript({
		target: { tabId },
		func: contentCopy,
		args: [textToCopy],
	});
}

function fetchThumbnailUrl(fileKey, nodeId) {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(
			{ token: "" },
			async(options) => {
				if (options.token) {
					const myHeaders = new Headers();
					myHeaders.append("X-Figma-Token", options.token);

					const requestOptions = {
						method: 'GET',
						headers: myHeaders,
						redirect: 'follow'
					};

					const response = await fetch(`https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}`, requestOptions);
					const jsonResponse = await response.json();
					if (jsonResponse.err) {
						reject('Failed to fetch thumbnail from the figma api: ' + JSON.stringify(jsonResponse.err));
						return;
					}

					resolve(jsonResponse.images[Object.keys(jsonResponse.images)[0]]);
				} else {
					reject(new Error('No token was found. Right click the extension and set a figma personal token in the options page.'));
				}
			}
		);
	});
}

chrome.action.onClicked.addListener((tab) => {
	if (tab.url.includes('https://www.figma.com/file/') || tab.url.includes('https://figma.com/file/')) {
		const matches = extractFileIdAndNodeId.exec(tab.url);
		console.log(matches);
		const fileKey = matches[2];
		const nodeId = matches[3];

		if (fileKey && nodeId) {
			fetchThumbnailUrl(fileKey, nodeId)
				.then(thumbnailUrl => {
					const markdown = `![figma screen](${thumbnailUrl})`;
					copyToClipboard(markdown, tab.id);
				})
				.catch((err) => {
					console.log('Failed to get the thumbnail url or copy it to the clipboard: ' + JSON.stringify(err));
				})
		} else {
			console.log('No file key and node id could be found in the url. Make sure you select a screen in figma first. Url should look like: figma.com/file/<fileKey>/<title>?node-id=<nodeId></title>');
		}
	}
});
