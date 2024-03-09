class SliderProductsControl {
	block: HTMLElement;
	link: HTMLElement | null;
	linkPagination: HTMLElement;
	pagination: HTMLElement | null;

	constructor(block: HTMLElement, blockClass: string) {
		this.block = block;
		this.link = this.block.querySelector(`${blockClass}__link`);
		this.pagination = this.block.querySelector(`${blockClass}__slider-pagination`);

		// вызов функций
		this.#paginationLink();
	}

	#paginationLink() {
		if (this.link) {
			const CLONE_LINK = this.link.cloneNode(true) as HTMLElement;
			CLONE_LINK.innerHTML = this.link.textContent || '';
			CLONE_LINK.className = '';
			CLONE_LINK.classList.add('slider__pagination-bullet', 'slider__pagination-link');

			this.pagination!.appendChild(CLONE_LINK);
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const blockClass = '.slider-products';
	const elems: NodeListOf<HTMLElement> = document.querySelectorAll(blockClass);
	elems.forEach((elem: HTMLElement) => {
		if (elem) {
			new SliderProductsControl(elem, blockClass);
		}
	});
});
