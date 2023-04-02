function saveOptions() {
	const input = document.querySelector('#figmaAccessTokenInput');

	chrome.storage.sync.set(
		{ token: input?.value },
		() => {
			// Update status to let user know options were saved.
			const button = document.querySelector('#saveOptionsButton');
			button.textContent = 'Saved successfully';
			setTimeout(() => {
				button.textContent = 'Save';
			}, 750);
		}
	);
}

const restoreOptions = () => {
	chrome.storage.sync.get(
		{ token: "" },
		(options) => {
			document.getElementById('#saveOptionsButton').value = options.token;
		}
	);
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#saveOptionsButton').addEventListener('click', saveOptions);
