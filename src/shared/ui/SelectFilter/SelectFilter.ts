import Choices from 'choices.js';
import Hammer from 'hammerjs';

export class SelectFilterControl {
	block: HTMLElement;
	choices: HTMLElement | null;
	choicesPlaceholder: HTMLElement | null | undefined;
	choicesList: HTMLElement | null | undefined;
	choicesInner: HTMLElement | null | undefined;
	choicesListWrap: HTMLElement;
	choicesInstance: Choices;

	constructor(block: HTMLElement) {
		this.block = block;
		this.choicesListWrap = document.createElement('div');

		this.choicesInstance = new Choices(this.block, {
			searchEnabled: false,
			itemSelectText: '',
			removeItemButton: true,
			shouldSort: false,
			allowHTML: false,
		});

		this.choices = this.block.closest('.choices');
		this.choicesList = this.choices?.querySelector('.choices__list[role="listbox"]');
		this.choicesPlaceholder = this.choicesList?.querySelector('.choices__placeholder');
		this.choicesInner = this.choices?.querySelector('.select__inner');

		this.init();
	}

	init() {
		this.#addEvents();
		this.#addSwipeElement();
	}

	// Добавление swipe элемента и caption на мобилке
	#addSwipeElement() {
		this.choicesListWrap.classList.add('choices__list--top');
		const choicesListTop = this.choicesList?.insertAdjacentElement('beforebegin', this.choicesListWrap) as Element;
		const el = `<div class="choices__list--swipe"></div><div class="choices__list--caption">${
			(this.choicesPlaceholder as HTMLElement).textContent
		}</div>`;

		choicesListTop.insertAdjacentHTML('afterbegin', el);
		// Hammer.js init
		const hammer = new Hammer(this.choicesListWrap);
		hammer.get('swipe').set({ direction: Hammer.DIRECTION_DOWN, threshold: 2, velocity: 0.5 });
		hammer.on('swipedown', () => this.choicesInstance.hideDropdown());
	}

	#addEvents() {
		this.choicesList?.querySelectorAll('[role="option"]').forEach((option) => {
			this.choices?.querySelector('.choices__button')?.addEventListener('mousedown', () => {
				this.choices?.classList.remove('js-no-dropdown');
			});
			if (option.classList.contains('is-selected') && !option.classList.contains('choices__placeholder')) {
				option.classList.contains('is-selected') && this.choices?.classList.add('js-no-dropdown');
			}
		});
		// Слушатели выбора и удаления селекта
		this.choices?.addEventListener('click', () => {
			this.choicesList?.querySelectorAll('[role="option"]').forEach((option) => {
				option.addEventListener('mousedown', () => {
					this.choices?.querySelector('.choices__button')?.addEventListener('mousedown', () => {
						this.choices?.classList.remove('js-no-dropdown');
					});

					this.choices?.classList.add('js-no-dropdown');
				});
			});
		});
	}

	clearChoices() {
		this.choices?.classList.remove('js-no-dropdown');
		this.choicesInstance.setChoiceByValue('');
	}
}

export function SelectFilter(el?: string): Array<SelectFilterControl> {
	const BLOCK_CLASS = el || '.select-filter';
	const SELECT_FILTER_ARRAY: Array<SelectFilterControl> = [];
	const ELEMS: NodeListOf<HTMLElement> = document.querySelectorAll(BLOCK_CLASS);
	ELEMS.forEach((elem) => {
		elem && SELECT_FILTER_ARRAY.push(new SelectFilterControl(elem));
	});
	return SELECT_FILTER_ARRAY;
}
