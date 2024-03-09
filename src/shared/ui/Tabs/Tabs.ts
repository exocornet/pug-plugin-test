class TabsControl {
	private readonly element: HTMLElement;
	buttons: NodeListOf<Element>;
	contents: NodeListOf<Element>;
	mode: string;

	constructor(element: HTMLElement) {
		this.mode = element.dataset.mode || 'default';
		this.element = element;
		this.buttons = element.querySelectorAll('.tabs__button');
		this.contents = element.querySelectorAll('.tabs__content');
		this.#init();
	}

	#init() {
		this.#addEvents();
		this.#showContent();
	}

	#addEvents() {
		this.buttons.forEach((button) => {
			(button as HTMLButtonElement).addEventListener('click', (e) => {
				(e.target as HTMLElement).scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
				this.#showContent(button as HTMLButtonElement);
			});
		});
	}

	#showContent(button?: HTMLButtonElement) {
		const isTransportMode = this.mode === 'transport';
		const isMainMode = this.mode === 'main';
		const initialIndex = isMainMode ? this.buttons.length - 1 : 0;
		const currentContent =
			button?.dataset.tabsButton || (this.buttons.item(initialIndex) as HTMLButtonElement)?.dataset.tabsButton;

		if (button) {
			const currentLevel: HTMLElement | null = button.closest('.tabs');

			if (currentLevel) {
				this.buttons = currentLevel.querySelector('.tabs__buttons')!.querySelectorAll(':scope > .tabs__button');
				this.contents = currentLevel.querySelector('.tabs__body')!.querySelectorAll(':scope > .tabs__content');
			}

			this.buttons.forEach((item) => {
				item.classList.remove('js-tabs-button-active');
				if (isTransportMode) {
					item.classList.remove('js-tabs-button-active-transport');
				}
			});
			button.classList.add('js-tabs-button-active');
			if (isTransportMode) {
				button.classList.add('js-tabs-button-active-transport');
			}
		} else {
			this.buttons.item(initialIndex)?.classList.add('js-tabs-button-active');
			if (isTransportMode) {
				this.buttons.item(initialIndex)?.classList.add('js-tabs-button-active-transport');
			}
		}

		this.contents.forEach((item) => {
			const element = item as HTMLElement;

			if (element.dataset.tabsContent === currentContent) {
				element.classList.add('js-tabs-content-active');
				if (isTransportMode) {
					element.classList.add('js-tabs-content-active-transport');
				}
			} else {
				element.classList.remove('js-tabs-content-active');
				if (isTransportMode) {
					element.classList.remove('js-tabs-content-active-transport');
				}
			}
		});
	}
}

export function Tabs(el?: string) {
	const SELECTOR_ELEMS = el || '.tabs';
	const ELEMS = document.querySelectorAll(SELECTOR_ELEMS);
	ELEMS.forEach((elem) => {
		if (elem) {
			(elem as ITabs).instance = new TabsControl(elem as HTMLElement);
		}
	});
}
