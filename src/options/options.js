function saveOptions() {
	const figmaTokenInput = document.querySelector('#figmaAccessTokenInput');
	const includeFigmaScreenLinkCheckbox = document.querySelector('#includeFigmaScreenLink');

	chrome.storage.sync.set(
		{
			token: figmaTokenInput?.value,
			includeFigmaScreenLink: includeFigmaScreenLinkCheckbox.checked,
		},
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
		{ token: "", includeFigmaScreenLink: false },
		(options) => {
			document.getElementById('#saveOptionsButton').value = options.token;
			document.getElementById('#includeFigmaScreenLink').checked = options.includeFigmaScreenLink;
		}
	);
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#saveOptionsButton').addEventListener('click', saveOptions);
