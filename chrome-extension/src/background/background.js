const extractFileIdAndNodeId = /https:\/\/(www\.)?figma\.com\/file\/([^/]+?)\/[^?]+\?node-id=([^&]+)/;

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
		target: { tabId },
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

async function fetchThumbnailUrl(fileKey, nodeId, token) {
	const myHeaders = new Headers();
	myHeaders.append("X-Figma-Token", token);

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

	return jsonResponse.images[Object.keys(jsonResponse.images)[0]];
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

		chrome.storage.sync.get(
			{ token: "", includeFigmaScreenLink: false },
			async(options) => {
				if (!options.token) {
					const error = 'No token was found. Right click the extension and set a figma personal token in the options page.';
					console.error(error);
					sendNotification('Error', error);
					return;
				}

				fetchThumbnailUrl(fileKey, nodeId, options.token)
					.then(thumbnailUrl => {

						let markdown = `![figma screen](${thumbnailUrl})`;
						if (options.includeFigmaScreenLink) {
							markdown += '\n' + tab.url;
						}
						copyToClipboard(markdown, tab.id);
					})
					.catch((err) => {
						const error = 'Failed to get the thumbnail url from the figma api: ' + JSON.stringify(err);
						console.error(error);
						sendNotification('Error', error);
					})
			})
	}
});
