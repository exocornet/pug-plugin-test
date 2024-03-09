class StatisticsMapControl {
	block: Element;
	circles: NodeListOf<HTMLElement>;
	paths: NodeListOf<HTMLElement>;
	circleKemerovo: SVGGeometryElement | null;
	circleKemerovoText: HTMLElement | null;

	constructor(block: Element) {
		this.block = block;

		this.circles = this.block.querySelectorAll('.statistics-map__circle');
		this.paths = this.block.querySelectorAll('.statistics-map__path');
		this.circleKemerovo = this.block.querySelector('.statistics-map__kemerovo');
		this.circleKemerovoText = this.block.querySelector('.statistics-map__kemerovo-text');

		// инициализация функций
		this.#init();
	}

	#init() {
		this.#animationPoint();
		this.#intervalAnimationPoint();
		this.#setKemerovoPoint();
	}

	#animationPoint() {
		this.circles.forEach((circle) => {
			if (circle.classList.contains('js-animation-radius-start')) {
				circle.addEventListener('animationend', (e: AnimationEvent) => {
					(e.currentTarget as HTMLElement).classList.remove('js-animation-radius-start');
					(e.currentTarget as HTMLElement).classList.add('js-animation-radius-end');
				});
			} else {
				circle.addEventListener('animationend', (e: AnimationEvent) => {
					(e.currentTarget as HTMLElement).classList.remove('js-animation-radius-end');
					(e.currentTarget as HTMLElement).classList.add('js-animation-radius-start');
				});
			}
		});
	}
	#setKemerovoPoint() {
		if (this.circleKemerovo && this.circleKemerovoText) {
			const pos = this.circleKemerovo?.getPointAtLength(0);
			this.circleKemerovoText.style.left = pos.x + 'px';
			this.circleKemerovoText.style.top = pos.y + 'px';
		}
	}

	#intervalAnimationPoint() {
		setInterval(() => {
			this.#animationPoint();
		}, 500);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const elems = document.querySelectorAll('.statistics-map');
	elems.forEach((elem: Element) => {
		if (elem) {
			new StatisticsMapControl(elem as HTMLElement);
		}
	});
});
