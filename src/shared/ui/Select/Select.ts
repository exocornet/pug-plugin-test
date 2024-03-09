export interface ISelect extends HTMLElement {
	selectInstance: SelectControl;
}
interface ModeSetClassLabel {
	add: () => void;
	remove: () => void;
}

export class SelectControl {
	block: HTMLElement;
	selectElement: HTMLSelectElement;

	constructor(block: HTMLElement) {
		this.block = block;
		this.createNewOptions = this.createNewOptions.bind(this);
		this.#initSelect();
	}

	#initSelect() {
		this.selectElement = this.block.getElementsByTagName('select')[0];
		const customSelected = this.block.querySelector('.custom-select__selected') as HTMLElement;
		this.createCustomOptions();
		this.addSelectedIndex(this.selectElement.selectedIndex);
		customSelected.addEventListener('click', (e) => this.clickItemSelected(e, this));
		document.addEventListener('click', (e) => this.closeAllSelect(e));
	}

	clickListenerCustomOptionItem(e: MouseEvent | Event, that: SelectControl) {
		const targetItem = e.target as HTMLElement;
		const textContent = targetItem?.textContent;
		const customSelect = targetItem.closest('.custom-select') as HTMLElement;
		const fieldContainer = targetItem.closest('.field__container') as HTMLElement;
		const floatingLabel = fieldContainer.querySelector('.field__floating-label') as HTMLElement;
		const selectedElement = customSelect.querySelector('.custom-select__selected') as HTMLElement;

		for (let i = 0; i < that.selectElement.length; i++) {
			if (that.selectElement.options[i].textContent == textContent) {
				that.selectElement.selectedIndex = i;
				that.selectElement.dispatchEvent(new Event('change'));
				if (selectedElement) {
					selectedElement.textContent = textContent;
					textContent && that.selectElement.setAttribute('data-selected', textContent);
					// textContent && that.selectElement.setAttribute('data-default-value', textContent);
					textContent && that.selectElement.setAttribute('data-selected-id', String(i));
				}
				this.addSameSelectedClass(i);
				break;
			}
		}
		floatingLabel.classList.add('custom-select_float-label');
		fieldContainer.classList.remove('field__error');
		const errorMessage = fieldContainer?.querySelector('.field__error-message') as HTMLElement;
		errorMessage.textContent = '';
		selectedElement?.click();
	}

	clickItemSelected(e: MouseEvent, that: SelectControl) {
		e.stopPropagation();
		const targetItem = e.target as HTMLElement;
		that.closeAllSelect(e);
		const customSelect = targetItem.closest('.custom-select') as HTMLElement;
		const selectItems = customSelect.querySelector('.custom-select__items') as HTMLElement;
		selectItems.classList.toggle('custom-select_hide');
		targetItem.classList.toggle('custom-select_arrow-active');
		if (selectItems.classList.contains('custom-select_hide') && that.selectElement.selectedIndex < 1) {
			this.changeClassFloatingLabel('remove');
		} else {
			this.changeClassFloatingLabel('add');
		}
	}

	closeAllSelect(e: MouseEvent) {
		e.stopPropagation();
		const targetItem = e.target as HTMLElement;
		const arrNo = [];
		const selectItems = this.block.getElementsByClassName('custom-select__items');
		const selected = this.block.getElementsByClassName('custom-select__selected');
		for (let i = 0; i < selected.length; i++) {
			if (targetItem == selected[i]) {
				arrNo.push(i);
			} else {
				selected[i].classList.remove('custom-select_arrow-active');
			}
		}
		const select = this.block.querySelector('select');
		for (let i = 0; i < selectItems.length; i++) {
			if (arrNo.indexOf(i)) {
				const fieldContainer = selectItems[i].closest('.field__container') as HTMLElement;
				const floatingLabel = fieldContainer.querySelector('.field__floating-label') as HTMLElement;
				selectItems[i].classList.add('custom-select_hide');
				if (select && select?.selectedIndex < 1) {
					floatingLabel.classList.remove('custom-select_float-label');
				}
			}
		}
	}

	createNewOptions(options: { text: string; key: string }[]) {
		if (this.selectElement.options.length > 1) {
			this.clearOptions();
			this.clearCustomOptions();
		}

		options.forEach((typeExample) => {
			const typeOption = document.createElement('option');
			typeOption.value = typeExample.key;
			typeOption.innerHTML = typeExample.text;
			this.selectElement.appendChild(typeOption);
		});
		this.createCustomOptions();
	}

	clearOptions() {
		for (let i = this.selectElement.options.length - 1; i >= 1; i--) {
			this.selectElement.remove(i);
		}
	}

	addSelectedIndex(index: number) {
		const customSelected = this.block.querySelector('.custom-select__selected') as HTMLElement;
		customSelected.innerHTML = this.selectElement.options[index].innerHTML;
	}

	changeClassFloatingLabel(mode: keyof ModeSetClassLabel) {
		const fieldContainer = this.block.closest('.field__container') as HTMLElement;
		const floatingLabel = fieldContainer.querySelector('.field__floating-label') as HTMLElement;
		const modeMap: ModeSetClassLabel = {
			add: () => floatingLabel.classList.add('custom-select_float-label'),
			remove: () => floatingLabel.classList.remove('custom-select_float-label'),
		};
		modeMap[mode]();
	}

	addSameSelectedClass(index: number) {
		const selectItems = this.block.querySelector('.custom-select__items') as HTMLElement;
		const sameSelected = selectItems.getElementsByClassName('same-as-selected');
		for (let k = 0; k < sameSelected?.length; k++) {
			sameSelected[k].classList.remove('same-as-selected');
		}
		const allCustomItems = this.block.querySelectorAll('.custom-select__item');
		allCustomItems[index - 1]?.classList.add('same-as-selected');
	}

	createCustomOptions() {
		const customSelectItems = this.block.querySelector('.custom-select__items') as HTMLElement;
		customSelectItems.classList.add('custom-select_hide');
		for (let j = 1; j < this.selectElement.length; j++) {
			const customOptionItem = document.createElement('DIV');
			customOptionItem.setAttribute('class', 'custom-select__item');
			customOptionItem.innerHTML = this.selectElement.options[j].innerHTML;
			customOptionItem.setAttribute('data-event-id', this.selectElement.options[j].getAttribute('data-event-id') || '');
			customOptionItem.addEventListener('click', (e) => this.clickListenerCustomOptionItem(e, this));
			customSelectItems.appendChild(customOptionItem);
		}
	}

	clearCustomOptions() {
		const customSelectItems = this.block.querySelector('.custom-select__items') as HTMLElement;
		const customSelectItem = this.block?.querySelectorAll('.custom-select__item');
		customSelectItems.classList.add('custom-select_hide');

		for (let i = customSelectItem.length - 1; i >= 0; i--) {
			customSelectItem[i].removeEventListener('click', (e) => this.clickListenerCustomOptionItem(e, this));
			customSelectItem[i].remove();
		}
	}
}

export function Select(el?: string): void {
	const selectorElems = el || '.custom-select';
	const elems: NodeListOf<ISelect> = document.querySelectorAll(selectorElems);

	elems.forEach((elem) => {
		const element = elem as ISelect;
		if (elem) {
			element.selectInstance = new SelectControl(elem as HTMLElement);
		}
	});
}
