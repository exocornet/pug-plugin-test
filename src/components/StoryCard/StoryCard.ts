import { VideoControl } from '../Video/Video';

class StoryCardControl {
	private readonly block: HTMLElement;
	private readonly video: VideoControl;
	constructor(element: HTMLElement) {
		this.block = element;
		this.video = new VideoControl(this.block.querySelector('.video') as HTMLElement, this.block.dataset.modalVideo);
		this.#addEvents();
	}

	#addEvents() {
		if (this.video) {
			this.block.addEventListener(
				'click',
				(e) => {
					if (this.video.videoType === 'iframe') {
						this.video?.openIframeInNewWindow();
					} else {
						this.video?.openVideoInNewWindow(e);
					}
				},
				false
			);
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const element: NodeListOf<HTMLElement> = document.querySelectorAll('.story-card');
	element.forEach((elem): void => {
		if (elem) {
			new StoryCardControl(elem);
		}
	});
});
