import Swiper from 'swiper';
import { EffectFade, Pagination, Navigation } from 'swiper/modules';
import { SwiperOptions } from 'swiper/types';

Swiper.use([EffectFade, Pagination, Navigation]);

export interface SliderWithControl extends HTMLElement {
	sliderControl?: SliderControl;
}

interface SlidesPerView {
	xs: string;
	md: string;
	xxl: string;
}

/** Класс настроек слайдера */
export class SliderControl {
	block: HTMLElement;
	swiper: HTMLElement;
	slideArr: NodeListOf<HTMLElement>;
	pagination: HTMLElement;
	buttonPrev: HTMLElement;
	buttonNext: HTMLElement;
	dataCustomPagination: string | undefined;
	sliderEffect: string;
	slidesPerView: SlidesPerView;
	dataLoop: string | boolean | undefined;
	dataDynamicBullets: string | undefined;
	slidesResizeable: boolean;
	sliderSpeed: number;
	swiperSlider: Swiper;

	constructor(block: SliderWithControl) {
		this.block = block;
		this.dataCustomPagination = this.block.dataset.customPagination;
		this.dataDynamicBullets = this.block.dataset.dynamicBullets;
		this.sliderEffect = this.block.dataset?.sliderEffect ? this.block.dataset.sliderEffect.toLowerCase() : 'fade';
		this.slidesPerView = this.block.dataset?.slidesPerView
			? this.createSlidesPerView(this.block.dataset.slidesPerView.toLowerCase())
			: { xs: '1', md: '1', xxl: '1' };
		this.slidesResizeable = this.block.dataset?.slidesResizeable === 'true';
		this.dataLoop = this.block.dataset?.slidesLoop?.toLowerCase();
		this.swiper = this.block.querySelector('.slider__swiper') as HTMLElement;
		this.slideArr = this.block.querySelectorAll('.slider__slide');
		this.pagination = this.block.querySelector('.slider__pagination') as HTMLElement;
		this.buttonPrev = this.block.querySelector('.slider__prev') as HTMLElement;
		this.buttonNext = this.block.querySelector('.slider__next') as HTMLElement;
		this.sliderSpeed = this.block.dataset?.sliderSpeed ? +this.block.dataset.sliderSpeed : 400;

		/** Инициализация слайдера */
		this.swiperSlider = new Swiper(this.swiper, this.optionsSlider());
	}

	createSlidesPerView(slidesPerView: string): SlidesPerView {
		const slidesPerViewFromData = slidesPerView.split(';');
		const slidesPerViewForMedia: SlidesPerView = {
			xxl: '1',
			md: '1',
			xs: '1',
		};

		Object.keys(slidesPerViewForMedia).forEach((key: string, index: number): void => {
			slidesPerViewForMedia[key as keyof SlidesPerView] = slidesPerViewFromData[index] ?? slidesPerViewFromData[0];
		});

		return slidesPerViewForMedia;
	}

	slideTo(index: number): void {
		this.swiperSlider.slideTo(index);
	}

	updateSlider() {
		this.swiperSlider.update();
	}

	isLoopRewind(): { [key: string]: boolean } {
		const objState: { [key: string]: string } = {
			true: 'true',
			rewind: 'rewind',
		};

		const isLoop: boolean = objState[`${this.dataLoop}`] === 'true';
		const isRewind: boolean = objState[`${this.dataLoop}`] === 'rewind';

		return {
			isLoop: isLoop,
			isRewind: isRewind,
		};
	}

	/**
	 * Управляет изменением размера слайдов в зависимости от размера экрана и текущего активного слайда.
	 * @returns {Object} Объект, содержащий методы для инициализации и обработки переходов между слайдами.
	 */
	// eventResizeableSlides = (): {
	// 	init: () => void;
	// 	beforeTransitionStart: () => void;
	// } => {
	// 	const block: HTMLElement = this.block;
	// 	const slides: HTMLElement[] = Array.from(this.slideArr);
	// 	// Проверяем, является ли размер экрана мобильным
	// 	const isMobile: boolean = window.matchMedia('(max-width: 767px)').matches;
	// 	// Получаем ширину блока
	// 	const blockWidth: number = this.block.offsetWidth;
	//
	// 	// Рассчитываем ширину слайда по умолчанию на основе размера экрана
	// 	const defaultWidth: string = isMobile
	// 		? `${blockWidth}px`
	// 		: 'calc(182.5px + (380 - 182.5) * ((100vw - 768px) / (1600 - 768)))';
	// 	// Рассчитываем активную ширину слайда на основе размера экрана
	// 	const activeWidth: string = isMobile
	// 		? `${blockWidth}px`
	// 		: 'calc((182.5px + (380 - 182.5) * ((100vw - 768px) / (1600 - 768))) * 3 - 20px)';
	//
	// 	return {
	// 		// Инициализирует ширину слайда и преобразует его для активного слайда.
	// 		init: function (): void {
	// 			// TODO: remove setTimeout (временный костыль)
	// 			setTimeout((): void => {
	// 				(slides as HTMLElement[])
	// 					.filter((slide: HTMLElement) => slide.classList.contains('swiper-slide-active'))
	// 					.forEach((slide: HTMLElement): void => {
	// 						slide.style.width = activeWidth;
	// 						block.style.transform = 'translate3d(0, 0px, 0px)';
	// 					});
	// 			}, 300);
	// 		},
	// 		/**
	// 		 * Обрабатывает ширину слайдов и преобразует их перед началом перехода.
	// 		 * Он проверяет, является ли текущий слайд активным, и соответствующим образом изменяет ширину слайдов.
	// 		 */
	// 		beforeTransitionStart: function (): void {
	// 			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// 			// @ts-ignore TODO: remove ts-ignore
	// 			if (slides.length !== this.activeIndex + 1) {
	// 				slides
	// 					.filter((slide: HTMLElement) => !slide.classList.contains('swiper-slide-active'))
	// 					.forEach((slide: HTMLElement): void => {
	// 						slide.style.width = defaultWidth;
	// 					});
	// 				slides
	// 					.filter((slide: HTMLElement) => slide.classList.contains('swiper-slide-active'))
	// 					.forEach((slide: HTMLElement): void => {
	// 						slide.style.width = activeWidth;
	// 						block.style.transform = 'translate3d(0, 0px, 0px)';
	// 						(block.children[0].children[1] as HTMLElement).style.transform = 'translate3d(0, 0px, 0px)';
	// 					});
	// 			} else {
	// 				slides
	// 					.filter((slide: HTMLElement) => !slide.classList.contains('swiper-slide-active'))
	// 					.forEach((slide: HTMLElement): void => {
	// 						slide.style.width = defaultWidth;
	// 					});
	// 				slides
	// 					.filter((slide: HTMLElement) => slide.classList.contains('swiper-slide-active'))
	// 					.forEach((slide: HTMLElement): void => {
	// 						slide.style.width = activeWidth;
	// 						block.style.transform = `translate3d(calc(${defaultWidth} + 20px), 0px, 0px)`;
	// 						(
	// 							block.children[0].children[1] as HTMLElement
	// 						).style.transform = `translate3d(calc(calc(${defaultWidth} + 20px) * -1), 0px, 0px)`;
	// 					});
	// 			}
	// 		},
	// 	};
	// };

	/** определение настроек слайдера */
	optionsSlider(): SwiperOptions {
		return {
			spaceBetween: this.sliderEffect === 'slide' ? 20 : 0,
			slidesPerView: this.slidesPerView.xs,
			loop: this.isLoopRewind().isLoop,
			rewind: this.isLoopRewind().isRewind,
			speed: this.sliderSpeed,
			breakpoints: {
				768: {
					slidesPerView: this.slidesPerView.md,
				},
				1600: {
					slidesPerView: this.slidesPerView.xxl,
				},
			},
			effect: this.sliderEffect,
			fadeEffect: {
				crossFade: true,
			},
			pagination: {
				el: this.pagination,
				clickable: true,
				renderBullet: (idx: number, className: string) => {
					if (this.dataCustomPagination) {
						const PAGINATION_ARR = this.dataCustomPagination.split(';');
						return `<span class='${className} slider__pagination-bullet'>${PAGINATION_ARR[idx]}</span>`;
					}
					return `<span class='${className} slider__pagination-bullet'>${++idx}</span>`;
				},
				dynamicBullets: this.dataDynamicBullets,
			},
			navigation: {
				prevEl: this.buttonPrev,
				nextEl: this.buttonNext,
			},
			// on: this.slidesResizeable ? this.eventResizeableSlides() : {},
		} as SwiperOptions;
	}
}

export function Slider(el?: string): void {
	const selectorElems: string = el || '.slider';
	const elems = document.querySelectorAll(selectorElems);
	elems.forEach((elem: Element): void => {
		if (elem) {
			const slider = elem as SliderWithControl;
			slider.sliderControl = new SliderControl(slider);
		}
	});
}
