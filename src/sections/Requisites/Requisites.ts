document.addEventListener('DOMContentLoaded', () => {
	const buttons = document.querySelectorAll('.js-copy-btn');
	buttons.forEach((button) => {
		const text = button?.parentElement?.innerText as string;
		button.addEventListener('click', () => {
			try {
				navigator.clipboard.writeText(text);
			} catch (e) {
				// eslint-disable-next-line no-console
				console.log((e as Error).message);
			}
		});
	});
});
