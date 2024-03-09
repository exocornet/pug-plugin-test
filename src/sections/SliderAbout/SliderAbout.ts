import { SliderWithControl } from '../../shared';
import Swiper from 'swiper';

class SliderAbout {
	private slider: SliderWithControl;
	private slides: NodeListOf<HTMLElement>;
	private swiper: Swiper;
	private readonly isMobile: boolean;
	private readonly sliderWidth: number;
	private readonly defaultWidth: string;
	private readonly activeWidth: string;

	constructor(private readonly section: HTMLElement) {
		this.slider = this.section.querySelector('.slider') as SliderWithControl;
		this.swiper = this.slider.sliderControl!.swiperSlider;
		this.slides = this.slider.querySelectorAll('.slider__slide') as NodeListOf<HTMLElement>;
		this.isMobile = window.matchMedia('(max-width: 767px)').matches;
		this.sliderWidth = this.slider.offsetWidth;
		this.defaultWidth = this.isMobile
			? `${this.sliderWidth}px`
			: 'calc(182.5px + (380 - 182.5) * ((100vw - 768px) / (1600 - 768)))';
		this.activeWidth = this.isMobile
			? `${this.sliderWidth}px`
			: 'calc((182.5px + (380 - 182.5) * ((100vw - 768px) / (1600 - 768))) * 3 - 20px)';

		this.updateSlider = this.updateSlider.bind(this);
		this.beforeTransitionStart = this.beforeTransitionStart.bind(this);

		if (!this.isMobile) {
			this.swiper.on('update', this.updateSlider);
			this.swiper.on('beforeTransitionStart', this.beforeTransitionStart);
			this.swiper.update();
		}
	}

	updateSlider() {
		const activeSlide = this.slider.querySelector('.swiper-slide-active') as HTMLElement;
		activeSlide.style.width = this.activeWidth;
		this.slider.style.transform = 'translate3d(0, 0px, 0px)';
	}

	beforeTransitionStart() {
		const activeSlide = this.slider.querySelector('.swiper-slide-active') as HTMLElement;
		this.slides.forEach((slide) => {
			slide.style.width = this.defaultWidth;
		});
		activeSlide.style.width = this.activeWidth;

		if (this.slides.length !== this.swiper.activeIndex + 1) {
			this.slider.style.transform = 'translate3d(0, 0, 0)';
			(this.slider.children[0].children[1] as HTMLElement).style.transform = 'translate3d(0, 0, 0)';
		} else {
			this.slider.style.transform = `translate3d(calc(${this.defaultWidth} + 20px), 0px, 0px)`;
			(
				this.slider.children[0].children[1] as HTMLElement
			).style.transform = `translate3d(calc(calc(${this.defaultWidth} + 20px) * -1), 0px, 0px)`;
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const section = document.querySelector('.slider-about') as HTMLElement;
	section && new SliderAbout(section);
});
