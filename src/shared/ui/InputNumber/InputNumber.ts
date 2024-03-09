class InputControl {
	block: HTMLInputElement;
	max: number;
	min: number;

	constructor(block: HTMLInputElement) {
		this.block = block;
		this.max = parseInt(this.block.max ? this.block.max : '10');
		this.min = parseInt(this.block.min ? this.block.min : '0');
		this.initInput();
	}

	initInput() {
		const container = this.block.closest('.field__container') as HTMLElement;
		const leftButton = container.querySelector('.input-number__button--left') as HTMLElement;
		const rightButton = container.querySelector('.input-number__button--right') as HTMLElement;

		this.block.addEventListener('invalid', function (event) {
			event.preventDefault();
			return;
		});
		leftButton.addEventListener('click', this.substractNumber.bind(this));
		rightButton.addEventListener('click', this.additionNumber.bind(this));
	}

	substractNumber() {
		const numberValue = parseInt(this.block.value);
		const currentValue = (numberValue ? numberValue : 0) - 1;
		if (currentValue < this.min) {
			return;
		}
		this.block.value = String(currentValue);
		this.block.dispatchEvent(new Event('change'));
	}

	additionNumber() {
		const numberValue = parseInt(this.block.value);
		const currentValue = (numberValue ? numberValue : 0) + 1;
		if (currentValue > this.max) {
			return;
		}
		this.block.value = String(currentValue);
		this.block.dispatchEvent(new Event('change'));
	}
}

export function InputNumber(el?: string): void {
	const inputElement = el || '.input-number';
	const elems = document.querySelectorAll(inputElement);
	elems.forEach((elem: Element) => {
		if (elem) {
			new InputControl(elem as HTMLInputElement);
		}
	});
}
