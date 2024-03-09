import { SliderWithControl } from '../../shared/ui/Slider/Slider';
import useTemplate from '../../shared/helpers/JS/useTemplate';

class TabsInnerTabMediaControl {
	private container: HTMLElement;
	private itemList: NodeListOf<HTMLImageElement> | null;
	private modalSlider: IModal;
	private readonly modalSliderSwiperWrapper: HTMLElement;
	private slider;

	constructor(element: HTMLElement, modal: IModal) {
		this.container = element;
		this.modalSlider = modal;
		this.itemList = this.container.querySelectorAll('.tabs-inner-tab-media__image');
		this.modalSliderSwiperWrapper = this.modalSlider.querySelector('.slider__slides-wrapper') as HTMLElement;
		this.slider = (this.modalSlider.querySelector('.slider') as SliderWithControl).sliderControl;

		this.#initChild();
	}

	#initChild() {
		this.itemList?.forEach((item: HTMLImageElement, key: number) => {
			item.addEventListener('click', () => {
				this.addSlides();
				this.slider?.slideTo(key);
				this.modalSlider.modalInstance.show();
			});
		});
	}

	addSlides() {
		(this.modalSliderSwiperWrapper?.childNodes as NodeListOf<HTMLElement>).forEach((child) => {
			if (child.classList && child.classList.contains('modal-image-slider__slide')) {
				child.remove();
			}
		});

		this.itemList?.forEach((item) => {
			const slideClone = useTemplate('slider-slide', this.modalSliderSwiperWrapper);
			const slideImg: HTMLImageElement = slideClone.querySelector('.modal-image-slider__image') as HTMLImageElement;
			const slideTextTitle: HTMLElement = slideClone.querySelector('.modal-image-slider__text-title') as HTMLElement;
			const slideTextDate: HTMLElement = slideClone.querySelector('.modal-image-slider__text-date') as HTMLElement;
			const slideButtonDownload: HTMLLinkElement = slideClone.querySelector(
				'.modal-image-slider__download'
			) as HTMLLinkElement;

			if (slideClone) {
				const imageInfo = item.dataset.imageInfo && JSON.parse(item.dataset.imageInfo);
				slideImg.src = item.src;
				slideTextTitle.textContent = imageInfo.text;
				slideTextDate.textContent = imageInfo.date;
				slideButtonDownload.href = item.src;
				this.modalSliderSwiperWrapper?.appendChild(slideClone);
			}
		});

		this.slider?.updateSlider();
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const containerCallers: NodeListOf<HTMLElement> = document.querySelectorAll('[data-modal-image-slider]');

	containerCallers.forEach((containerCaller) => {
		const modal = document.querySelector(`div[data-name=${containerCaller.dataset.modalImageSlider}]`) as IModal;
		new TabsInnerTabMediaControl(containerCaller, modal);
	});
});
