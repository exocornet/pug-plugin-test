// type TDropList = {
// 	[key: string]: string;
// };

export default class DropList {
	private button: HTMLButtonElement;
	private listItems: HTMLHtmlElement;
	private defaultValue: string;
	private itemsArr: NodeListOf<HTMLElement>;
	private inputHidden: HTMLInputElement;

	constructor(private readonly element: HTMLElement) {
		this.button = this.element.querySelector('.drop-list__button') as HTMLButtonElement;
		this.listItems = this.element.querySelector('.drop-list__items') as HTMLHtmlElement;
		this.itemsArr = this.listItems.querySelectorAll('.drop-list__item') as NodeListOf<HTMLElement>;
		this.inputHidden = this.element.querySelector('.drop-list__input') as HTMLInputElement;
		this.defaultValue = '';

		this.#addEvents();
	}

	#addEvents() {
		this.button.addEventListener('click', (e) => this.#toggleItems(e));
		this.itemsArr.forEach((item) => {
			item.addEventListener('click', () => this.#setValue(item));
		});
		document.addEventListener('click', (e) => this.#closeItems(e));
	}

	#closeItems(e: Event) {
		const target = e.target as HTMLElement;
		if (!target.closest('.drop-list')) {
			this.element.classList.remove('open');
		}
	}

	#toggleItems(e?: Event) {
		e && e.stopImmediatePropagation();
		this.element.classList.toggle('open');
	}

	#setValue(item: HTMLElement) {
		this.inputHidden.value = item.dataset.value || this.defaultValue;
		(this.button.querySelector('span') as HTMLElement).textContent = item.textContent || this.defaultValue;
		this.#toggleItems();
	}
}
