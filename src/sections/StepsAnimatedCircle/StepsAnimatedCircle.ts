import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useMediaQuery } from '../../shared/helpers/JS/useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

class StepsAnimatedCircleControl {
	block: Element;
	svg: SVGElement;
	content: HTMLDivElement;
	clonedElement: HTMLDivElement;
	line: HTMLDivElement;

	step1List: NodeListOf<Element>;
	step1Number: SVGTextElement;
	step1Loading: SVGPathElement;
	step1Image: SVGImageElement;
	step1Title: SVGTextElement;
	step1Description: SVGTextElement;

	step2List: NodeListOf<Element>;
	step2Number: SVGTextElement;
	step2Loading: SVGPathElement;
	step2Image: SVGImageElement;
	step2Title: SVGTextElement;
	step2Description: SVGTextElement;

	step3List: NodeListOf<Element>;
	step3Number: SVGTextElement;
	step3Loading: SVGPathElement;
	step3Image: SVGImageElement;
	step3Title: SVGTextElement;
	step3Description: SVGTextElement;

	constructor(block: Element, classBlock: string) {
		this.block = block;
		this.svg = this.block.querySelector(`${classBlock}__svg`) as SVGElement;
		this.content = this.block.querySelector(`${classBlock}__content`) as HTMLDivElement;
		this.clonedElement = this.block.querySelector(`${classBlock}__cloned-element`) as HTMLDivElement;
		this.line = this.block.querySelector(`${classBlock}____line`) as HTMLDivElement;

		this.step1List = this.block.querySelectorAll('.js-step-1');
		this.step1Number = this.block.querySelector('.js-step-1-number') as SVGTextElement;
		this.step1Loading = this.block.querySelector('.js-step-1-loading') as SVGPathElement;
		this.step1Image = this.block.querySelector('.js-step-1-image') as SVGImageElement;
		this.step1Title = this.block.querySelector('.js-step-1-title') as SVGTextElement;
		this.step1Description = this.block.querySelector('.js-step-1-description') as SVGTextElement;

		this.step2List = this.block.querySelectorAll('.js-step-2');
		this.step2Number = this.block.querySelector('.js-step-2-number') as SVGTextElement;
		this.step2Loading = this.block.querySelector('.js-step-2-loading') as SVGPathElement;
		this.step2Image = this.block.querySelector('.js-step-2-image') as SVGImageElement;
		this.step2Title = this.block.querySelector('.js-step-2-title') as SVGTextElement;
		this.step2Description = this.block.querySelector('.js-step-2-description') as SVGTextElement;

		this.step3List = this.block.querySelectorAll('.js-step-3');
		this.step3Number = this.block.querySelector('.js-step-3-number') as SVGTextElement;
		this.step3Loading = this.block.querySelector('.js-step-3-loading') as SVGPathElement;
		this.step3Image = this.block.querySelector('.js-step-3-image') as SVGImageElement;
		this.step3Title = this.block.querySelector('.js-step-3-title') as SVGTextElement;
		this.step3Description = this.block.querySelector('.js-step-3-description') as SVGTextElement;

		// Получаем длину пути
		const pathLengthStep1 = this.step1Loading.getTotalLength();
		const pathLengthStep2 = this.step2Loading.getTotalLength();
		const pathLengthStep3 = this.step3Loading.getTotalLength();

		// Устанавливаем начальные значения атрибутов stroke-dasharray и stroke-dashoffset
		this.step1Loading.setAttribute('stroke-dasharray', pathLengthStep1.toString());
		this.step1Loading.setAttribute('stroke-dashoffset', pathLengthStep1.toString());
		this.step2Loading.setAttribute('stroke-dasharray', pathLengthStep2.toString());
		this.step2Loading.setAttribute('stroke-dashoffset', pathLengthStep2.toString());
		this.step3Loading.setAttribute('stroke-dasharray', pathLengthStep3.toString());
		this.step3Loading.setAttribute('stroke-dashoffset', pathLengthStep3.toString());

		this.mobileAnimation = this.mobileAnimation.bind(this);
		this.desktopAnimation = this.desktopAnimation.bind(this);

		// ## Инициализация ## //
		this.#init();
	}

	#init() {
		this.#animationChange();
	}

	#animationChange() {
		if (window.innerWidth <= 767) {
			this.mobileAnimation();
		} else {
			this.desktopAnimation();
		}

		useMediaQuery(this.mobileAnimation, this.desktopAnimation);
	}

	// ## Настройки timeline и scrollTrigger для анимации в секцие ## //
	tlScrollTrigger() {
		return gsap.timeline({
			scrollTrigger: {
				trigger: this.svg,
				start: 'top top',
				pin: true,
				scrub: true,
			},
		});
	}

	// ## Анимация для десктопа ## //
	desktopAnimation() {
		this.tlScrollTrigger()
			.to(this.step1Loading, { strokeDashoffset: 0, duration: 60 })
			//1 скрытие картинки и надписи первого этапа
			.to([this.step1Image, this.step1Title, this.step1Description], { opacity: 0, duration: 60 })

			//1 убираем фон и красим цифру первого этапа
			.to(this.step1Number, {
				color: 'hsla(0, 0%, 0%, 1)',
				background: 'hsla(0, 0%, 97%, 1)',
				outline: 'solid 1px hsla(0, 0%, 85%, 1)',
				duration: 0,
			})

			//2 красим фон и красим цифру второго этапа
			.to(this.step2Number, {
				color: 'hsla(0, 0%, 100%, 1)',
				background: 'hsla(0, 0%, 0%, 1)',
				outline: 'none',
				duration: 0,
			})

			//2 появление картинки и надписи второго этапа
			.fromTo(
				[this.step2Image, this.step2Title, this.step2Description],
				{ opacity: 0, y: 100 },
				{ opacity: 1, y: 0, duration: 60 }
			)

			//2 линия загрузки второго этапа
			.to(this.step2Loading, { strokeDashoffset: 0, duration: 60 })

			//2 скрытие картинки и надписи второго этапа
			.to([this.step2Image, this.step2Title, this.step2Description], { opacity: 0, duration: 60 })

			//2 убираем фон и красим цифру второго этапа
			.to(this.step2Number, {
				color: 'hsla(0, 0%, 0%, 1)',
				background: 'hsla(0, 0%, 97%, 1)',
				outline: 'solid 1px hsla(0, 0%, 85%, 1)',
				duration: 0,
			})

			//3 красим фон и красим цифру третьего этапа
			.to(this.step3Number, {
				color: 'hsla(0, 0%, 100%, 1)',
				background: 'hsla(0, 0%, 0%, 1)',
				outline: 'none',
				duration: 0,
			})

			//3 линия загрузки третьего этапа
			.fromTo(
				[this.step3Image, this.step3Title, this.step3Description],
				{ opacity: 0, y: 100 },
				{ opacity: 1, y: 0, duration: 60 }
			)
			.to(this.step3Loading, { strokeDashoffset: 0, duration: 60 });
	}

	// ## Анимация для мобилки ## //
	mobileAnimation() {
		function createStep(newClassStep: number, nodeList: NodeListOf<Element>, appendContainer: HTMLDivElement) {
			const STEP = document.createElement('div');
			STEP.classList.add(`js-step-${newClassStep}`);
			nodeList.forEach((element, idx) => {
				if (idx === 0) {
					const DIV = document.createElement('div');
					DIV.classList.add('js-number-name-container');
					element.children[0]?.classList.add(`steps-animated-circle__step-${newClassStep}-number`);
					DIV.append(element.children[0]);
					DIV.append(nodeList[1].children[0]);
					STEP.append(DIV);
				} else if (idx !== 1) {
					STEP.append(element.children[0]);
				}
				element.remove();
			});
			appendContainer.appendChild(STEP);
		}

		createStep(1, this.step1List, this.clonedElement);
		createStep(2, this.step2List, this.clonedElement);
		createStep(3, this.step3List, this.clonedElement);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const selectorElems: string = '.steps-animated-circle';
	const elems = document.querySelectorAll(selectorElems);
	elems.forEach((elem: Element) => {
		if (elem) {
			new StepsAnimatedCircleControl(elem as HTMLElement, selectorElems);
		}
	});
});
