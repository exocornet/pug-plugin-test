import { VideoContainer } from 'globalInterfaces';

interface IVideoSettings {
	controls?: boolean;
	muted?: boolean;
	isClicked?: boolean;
}

export class VideoControl {
	private readonly container: HTMLElement;
	private readonly videoTimer: HTMLElement;
	private readonly video: HTMLVideoElement;
	private readonly iframe: HTMLIFrameElement;
	private isModalCalled: boolean = true;
	private readonly range: HTMLInputElement;
	private readonly videoScrollBar: HTMLElement;
	private readonly caption: HTMLElement | null;
	private timing: string;
	private rewind: string | null;
	private readonly controlClasses: string[] = ['playing', 'paused', 'replay', 'rewind', 'forward'];
	private touchMoveTimer: NodeJS.Timeout;
	private readonly settings: IVideoSettings;
	private modalVideo: IModal | null;
	videoType: string;
	paused: boolean = true;

	constructor(element: HTMLElement, modalName?: string | null) {
		this.modalVideo = modalName ? document.querySelector(`[data-name=${modalName}]`) : null;
		this.container = element;
		this.range = this.container.querySelector('.video__range') as HTMLInputElement;
		this.video = this.container.querySelector('video') as HTMLVideoElement;
		this.iframe = this.container.querySelector('iframe') as HTMLIFrameElement;
		this.videoTimer = this.container.querySelector('.video__timer') as HTMLElement;
		this.videoScrollBar = this.container.querySelector('.video__scroll-bar') as HTMLElement;
		this.caption = this.container.querySelector('.video__caption');

		if (this.video) {
			this.videoType = 'video';
			this.settings = this.#createSettings();
			this.video.load();
			this.video.addEventListener('loadedmetadata', () => this.init());
		} else if (this.iframe) {
			this.videoType = 'iframe';
			this.container.dataset.videoSettings &&
				(this.iframe.src += JSON.parse(this.container.dataset.videoSettings).muted ? '&mute=1' : '');
			this.#addIframeEvents();
		}
		this.rangeTouchMove = this.rangeTouchMove.bind(this);
	}

	init() {
		this.#setDefaultsSettings();
		this.#addEvents();
		this.#addHideEvents();
	}

	#addHideEvents() {
		this.modalVideo?.modalInstance.overlay &&
			(this.modalVideo.modalInstance.overlay.onclick = () => {
				this.#clearModal();
			});

		const modalClose: HTMLElement | undefined | null = this.modalVideo?.querySelector('.modal__close');

		modalClose &&
			(modalClose.onclick = () => {
				this.#clearModal();
			});
	}

	#createSettings() {
		const settings = this.container.dataset.videoSettings ? JSON.parse(this.container.dataset.videoSettings) : {};
		return new Proxy(settings, {
			set: (obj, prop, value) => {
				obj[prop] = value;
				this.#setDefaultsSettings();
				return true;
			},
		});
	}

	#setDefaultsSettings() {
		this.video.volume = 0;
		this.range.max = String(this.video.duration);
		this.range.classList.add('paused');
		const { muted, controls } = this.settings;
		(this.container.querySelector('.video__controls') as HTMLElement).style.display = controls === false ? 'none' : '';
		this.video.volume = 1;
		this.video.muted = muted || false;
		this.#changeControlsPosition();
	}

	#addEvents() {
		this.video.addEventListener('timeupdate', (event) => this.#videoTimeUpdate(event));
		this.range.addEventListener('input', (e) => this.#videoRewind(e));
		this.range.addEventListener('click', (e) => this.#videoHandler(e));
		this.range.addEventListener('touchstart', (e) => this.#videoHandlerMobile(e));
		this.range.addEventListener('touchend', (e) => this.#videoEndHandlerMobile(e));
		this.video.addEventListener('ended', () => this.#changeControlClass('replay'));
		if (this.modalVideo) {
			this.container.addEventListener(
				'click',
				(e) => {
					this.openVideoInNewWindow(e);
				},
				false
			);
		}

		// window.addEventListener('orientationchange', () => {
		// 	if (screen.orientation.angle === 0) {
		// 		this.exitFullscreen();
		// 	}
		// });
		// if (deviceDetector.detect().IS_MOBILE) {
		// 	this.video.addEventListener('playing', () => this.enterFullscreen());
		// }
	}

	#addIframeEvents() {
		if (this.modalVideo) {
			this.container.querySelector('.video__iframe-popup-caller')?.addEventListener('click', () => {
				this.openIframeInNewWindow();
			});
		}
	}

	#changeControlClass(controlClass: string) {
		if (this.range) {
			this.range.classList.remove(...this.controlClasses);
			this.range.classList.add(controlClass);
		}
	}

	#videoRewind(e?: Event) {
		e?.stopImmediatePropagation();
		e?.preventDefault();
		this.video.currentTime = Number(this.range.value);
		if (Number(this.timing) < Number(this.range.value)) {
			this.rewind = 'forward';
		}
		if (Number(this.timing) > Number(this.range.value)) {
			this.rewind = 'rewind';
		}
		this.timing = this.range.value;
		this.videoTimer.innerText = this.#formatTime(this.video.currentTime);
		this.rewind && this.#changeControlClass(this.rewind);
		this.#changeControlsPosition();
	}

	#videoHandler(e: MouseEvent | TouchEvent) {
		if ('button' in e && e.button > 0) {
			return;
		}
		if (this.video.paused && this.rewind) {
			this.#changeControlClass('paused');
			this.rewind = null;
		} else if (this.video.played && this.rewind) {
			this.#changeControlClass('playing');
			this.rewind = null;
		} else if (this.video.paused && !this.rewind) {
			this.play();
		} else if (!this.video.paused && !this.rewind) {
			this.pause();
		}
	}

	#videoHandlerMobile(event: TouchEvent) {
		event.preventDefault();
		this.touchMoveTimer = setTimeout(() => {
			this.range.addEventListener('touchmove', this.rangeTouchMove);
		}, 200);
	}

	rangeTouchMove(event: TouchEvent) {
		event.preventDefault();
		const touch = event.touches[0];
		let value = ((touch.clientX - 40 - this.range.offsetLeft) / this.range.clientWidth) * parseInt(this.range.max);
		if (value > this.video.duration) value = this.video.duration;
		if (value < 0) value = 0;
		this.range.value = String(value);
		this.#videoRewind();
		this.#changeControlsPosition(value);
	}

	#videoEndHandlerMobile(event: TouchEvent) {
		event.preventDefault();
		this.touchMoveTimer && clearTimeout(this.touchMoveTimer);
		this.range.removeEventListener('touchmove', this.rangeTouchMove);
		this.#videoHandler(event);
	}

	#videoTimeUpdate(event: Event) {
		this.videoTimer.innerText = this.#formatTime(this.video.currentTime);
		this.timing = String((event.target as HTMLVideoElement).currentTime);
		this.range.value = String((event.target as HTMLVideoElement).currentTime);
		this.#changeControlsPosition();
	}

	#changeControlsPosition(value?: number) {
		this.videoTimer.classList.remove('toRight', 'toLeft');
		let val = null;
		if (value) {
			val = (value * 100) / this.video.duration;
		} else {
			val = (this.video.currentTime * 100) / this.video.duration;
		}
		const newPosition = -(val * 0.4);
		this.videoTimer.style.left = `calc(${val}% + (${newPosition}px))`;
		this.videoScrollBar.style.left = `calc(${val}% + (${newPosition}px))`;
		if (val < 50) {
			this.videoTimer.classList.add('toRight');
		} else {
			this.videoTimer.classList.add('toLeft');
		}
	}

	#formatTime(seconds: number) {
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	openVideoInNewWindow(event: Event) {
		const element = event.target as HTMLElement;
		if (!element.classList.contains('video__range') && this.modalVideo && this.isModalCalled) {
			this.pause();
			this.isModalCalled = false;
			const modalContainer: VideoContainer = this.container.cloneNode(true) as VideoContainer;

			this.modalVideo.querySelector('.modal__inner_video')?.append(this.#prepareModalVideo(modalContainer));
			modalContainer.videoPlayer = new VideoControl(modalContainer);
			modalContainer.videoPlayer.settings.controls = true;
			modalContainer.videoPlayer.pause();
			modalContainer.videoPlayer.range.value = 0;
			modalContainer.videoPlayer.#videoRewind();

			modalContainer.videoPlayer.video.oncanplay = () => {
				this.modalVideo?.modalInstance.show();
				this.isModalCalled = true;
			};
		}
	}

	openIframeInNewWindow() {
		if (this.modalVideo && this.isModalCalled) {
			this.pause();
			this.isModalCalled = false;
			const modalContainer: HTMLElement = this.container.cloneNode(true) as HTMLElement;
			const innerIframe = modalContainer.querySelector('.video__iframe') as HTMLIFrameElement;

			this.modalVideo.querySelector('.modal__inner_video')?.append(this.#prepareModalVideo(modalContainer));

			if (innerIframe) {
				this.modalVideo?.modalInstance.show();
				this.isModalCalled = true;
			}
		}
	}

	#prepareModalVideo(modalContainer: Element) {
		(<Element>modalContainer).className = 'video position-relative';
		this.modalVideo?.querySelectorAll('.video')?.forEach((el) => {
			el.remove();
		});
		(<Element>modalContainer).querySelector('.video__caption')?.remove();
		modalContainer.querySelector('.video__iframe-popup-caller')?.remove();
		return modalContainer;
	}

	#clearModal() {
		this.modalVideo?.querySelectorAll('.video')?.forEach((el) => {
			el.remove();
		});
	}

	play() {
		if (this.video) {
			this.#changeControlClass('playing');
			if (this.caption) {
				this.caption.style.opacity = '1';
			}
			this.video.play();
		}
		if (this.iframe) {
			const message = JSON.stringify({
				event: 'command',
				func: 'playVideo',
			});
			this.iframe.contentWindow?.postMessage(message, 'https://www.youtube.com');
		}
		this.paused = false;
	}

	pause() {
		if (this.video) {
			this.#changeControlClass('paused');
			if (this.caption) {
				this.caption.style.opacity = '0';
			}
			this.video.pause();
		}
		if (this.iframe) {
			const message = JSON.stringify({
				event: 'command',
				func: 'pauseVideo',
			});
			this.iframe.contentWindow?.postMessage(message, 'https://www.youtube.com');
		}
		this.paused = true;
	}

	// exitFullscreen() {
	// 	// eslint-disable-next-line no-console
	// 	document.exitFullscreen().catch(console.error);
	// }
	//
	// enterFullscreen() {
	// 	// eslint-disable-next-line no-console
	// 	this.video.requestFullscreen().catch(console.error);
	// }
}

document.addEventListener('DOMContentLoaded', () => {
	const videos = document.querySelectorAll('.video') as NodeListOf<HTMLElement>;
	videos.forEach((video) => {
		const element = video as VideoContainer;
		const modalName = video.dataset.modalVideo ? video.dataset.modalVideo : null;
		element.videoPlayer = new VideoControl(element, modalName);
	});
});
