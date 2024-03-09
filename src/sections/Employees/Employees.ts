import { VideoContainer } from 'globalInterfaces';

class EmployeesControl {
	private readonly sections: HTMLElement;
	private rightBlock: NodeListOf<Element>;
	private leftBlock: NodeListOf<Element>;

	constructor(element: HTMLElement) {
		this.sections = element;
		this.rightBlock = this.sections.querySelectorAll('.js-card-personal-resize-right');
		this.leftBlock = this.sections.querySelectorAll('.js-card-personal-resize-left');
		this.#init();
	}

	#addEvents() {
		this.rightBlock?.forEach((item) => {
			item.addEventListener('mouseenter', (event) => this.#rightBlockHover(event), { capture: false });
			item.addEventListener('mouseleave', (event) => this.#rightBlockHover(event), { capture: false });
		});
		this.leftBlock?.forEach((item) => {
			item.addEventListener('mouseenter', (event) => this.#leftBlockHover(event), { capture: false });
			item.addEventListener('mouseleave', (event) => this.#leftBlockHover(event), { capture: false });
		});
	}

	#init() {
		this.#addEvents();
	}

	#leftBlockHover(event: Event) {
		const target = event.target as HTMLElement;
		const next = target.nextElementSibling as HTMLElement;
		this.playerHandler(target);
		this.elementResize(target, next);
	}

	#rightBlockHover(event: Event) {
		const target = event.target as HTMLElement;
		const prev = target.previousElementSibling as HTMLElement;
		this.playerHandler(target);
		this.elementResize(target, prev);
	}

	elementResize(element1: HTMLElement, element2: HTMLElement) {
		['col-5', 'col-7', 'playing'].forEach((cls) => {
			element1.classList.toggle(cls);
		});
		['col-5', 'col-3'].forEach((cls) => {
			element2.classList.toggle(cls);
		});
	}

	playerHandler(target: HTMLElement) {
		const videoPlayer = (target.querySelector('.video') as VideoContainer).videoPlayer;
		if (videoPlayer.settings) {
			if (videoPlayer.paused && !target.classList.contains('playing')) {
				videoPlayer.settings.controls = true;
				videoPlayer.play();
			} else {
				videoPlayer.settings.controls = false;
				videoPlayer.pause();
			}
		} else {
			if (videoPlayer.paused) {
				videoPlayer.play();
			} else {
				videoPlayer.pause();
			}
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const element = document.querySelector('.employees') as HTMLElement;
	element && new EmployeesControl(element);
});
