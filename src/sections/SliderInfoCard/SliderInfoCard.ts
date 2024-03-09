class SliderInfoCardControl {
	block: Element;
	link: HTMLElement;
	pagination: HTMLElement;

	constructor(block: Element) {
		this.block = block;
		this.link = this.block.querySelector('.slider-info-card__bottom-link') as HTMLElement;
		this.pagination = this.block.querySelector('.slider-info-card__slider-pagination') as HTMLElement;

		// вызов функций
		this.#paginationLink();
	}

	#paginationLink() {
		const CLONE_LINK = this.link?.cloneNode(true) as HTMLElement;
		CLONE_LINK.innerHTML = this.link.textContent || '';
		CLONE_LINK.className = '';
		CLONE_LINK.classList.add('slider__pagination-bullet');

		this.pagination.appendChild(CLONE_LINK);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const elems = document.querySelectorAll('.slider-info-card');
	elems.forEach((elem: Element) => {
		if (elem) {
			new SliderInfoCardControl(elem as HTMLElement);
		}
	});
});
