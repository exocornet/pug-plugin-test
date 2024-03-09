class SliderHistoryControl {
	block: Element;
	bigImageComponent: HTMLElement;
	smallImageComponent: HTMLElement;

	currentSlider: HTMLElement;
	timeOut: ReturnType<typeof setTimeout> = setTimeout(() => '', 1000);

	constructor(block: Element) {
		this.block = block;
		// вызов функций
		this.#getCurrentWrapperComponents();
		this.#addEvents();
	}

	#getCurrentWrapperComponents() {
		this.currentSlider = this.block.querySelector('.swiper-slide-active') as HTMLElement;

		this.bigImageComponent = this.currentSlider.querySelector('.slider-history__wrap-big-picture') as HTMLElement;
		this.smallImageComponent = this.currentSlider.querySelector('.slider-history__bg-wrap') as HTMLElement;
	}

	#clean() {
		const navigation = this.block.querySelector('.slider-history__slider-navigation');
		if (navigation) {
			navigation.classList.remove('slider-history__flex', '.slider-history__none');
		}
		this.bigImageComponent.classList.remove('slider-history__close', 'slider-history__open');
		this.smallImageComponent.classList.remove('slider-history__open', 'slider-history__close');
	}

	#close() {
		const navigation = this.block.querySelector('.slider-history__slider-navigation');
		if (navigation) {
			navigation.classList.add('slider-history__flex');
		}
		this.bigImageComponent.classList.add('slider-history__close');
		this.smallImageComponent.classList.add('slider-history__open');
	}

	#open() {
		const navigation = this.block.querySelector('.slider-history__slider-navigation');
		if (navigation) {
			navigation.classList.add('slider-history__none');
		}
		this.bigImageComponent.classList.add('slider-history__open');
		this.smallImageComponent.classList.add('slider-history__close');
	}

	#addEvents(): void {
		document.addEventListener('keydown', (event) => {
			this.#getCurrentWrapperComponents();
			if (event.key === 'Escape') {
				this.#clean();
				this.#close();
			}
		});

		document.addEventListener('click', (event) => {
			this.#getCurrentWrapperComponents();
			const target = event.target as HTMLElement;
			if (target.classList.contains('slider-history__close-button-wrapper')) {
				this.#clean();
				this.#close();
			}
			if (target.classList.contains('slider-history__picture-wrap')) {
				this.#clean();
				this.#open();
			}
		});

		document.addEventListener('mouseover', (event) => {
			const target = event.target as HTMLElement;
			if (target?.classList?.contains('slider-history__picture-wrap')) {
				setTimeout(() => {
					this.#clean();
					this.#open();
				}, 100);
			} else {
				setTimeout(() => {
					this.#clean();
					this.#close();
				}, 100);
			}
		});
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const selectorElems = '.slider-history';
	const elems = document.querySelectorAll(selectorElems);
	elems.forEach((elem: Element) => {
		if (elem) {
			new SliderHistoryControl(elem as HTMLElement);
		}
	});
});
