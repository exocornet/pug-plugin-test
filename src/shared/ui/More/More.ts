class MoreControl {
	private readonly element: HTMLElement;
	private readonly items: NodeListOf<Element>;
	dataMoreDesktop: string;
	dataMoreDesktopStep: string;
	dataMoreMobile: string;
	dataMoreMobileStep: string;
	button: HTMLElement | undefined;
	shownItemsCount: number;
	step: string;

	constructor(element: HTMLElement) {
		this.element = element;
		this.items = element.querySelectorAll('.js-more-item');
		this.dataMoreDesktop = this.element?.dataset?.moreDesktop || '4';
		this.dataMoreDesktopStep = this.element?.dataset?.moreDesktopStep || 'all';
		this.dataMoreMobile = this.element?.dataset?.moreMobile || this.dataMoreDesktop;
		this.dataMoreMobileStep = this.element?.dataset?.moreMobileStep || this.dataMoreDesktopStep;
		this.shownItemsCount = 0;
		this.step = window.innerWidth < 768 ? this.dataMoreMobileStep : this.dataMoreDesktopStep;
		this.#init();
	}

	#init() {
		this.#showItems();
		this.#addButton();
	}

	#showItems() {
		if (this.shownItemsCount === 0) {
			this.shownItemsCount = +(window.innerWidth < 768 ? this.dataMoreMobile : this.dataMoreDesktop);
		} else {
			this.shownItemsCount = this.step === 'all' ? this.items.length : this.shownItemsCount + +this.step;
		}

		this.items.forEach((item, index) => {
			index >= this.shownItemsCount ? item.classList.add('d-none') : item.classList.remove('d-none');
		});
	}

	#addButton() {
		const isHideItems = this.items.length > +(window.innerWidth < 768 ? this.dataMoreMobile : this.dataMoreDesktop);
		if (!isHideItems) return;

		const button: HTMLButtonElement = document.createElement('button');
		const buttonContainer: HTMLDivElement = document.createElement('div');
		buttonContainer.classList.add('more-button-container', 'w-100');

		this.button = button;
		button.classList.add(
			'button',
			'button_large',
			'd-block',
			'w-100@xs',
			'mx-auto',
			'mt-40',
			'mt-20@xs',
			'js-more-button'
		);
		this.button && (this.button.innerHTML = `<span>${this.element.dataset?.buttonText}</span>`);
		button.addEventListener('click', () => {
			this.#showItems();
			if (this.shownItemsCount >= this.items.length) {
				button.classList.add('d-none');
			}
		});

		buttonContainer.append(button);
		this.element.append(buttonContainer);
	}
}

export function More() {
	const MORE_ELEMS = document.querySelectorAll('.js-more');
	MORE_ELEMS.forEach((elem) => {
		if (elem) {
			new MoreControl(elem as HTMLElement);
		}
	});
}
