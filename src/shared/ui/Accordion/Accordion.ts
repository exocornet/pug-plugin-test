class AccordionControl {
	accordion: HTMLElement;
	accordionBody: HTMLElement | null;

	constructor(block: HTMLElement, blockClass: string) {
		this.accordion = block;
		this.accordionBody = this.accordion.querySelector(`${blockClass}__body`);

		this.#init();
	}

	#init() {
		this.#bindClick(this.accordion);
	}

	#bindClick(elem: HTMLElement) {
		elem.addEventListener('click', () => {
			elem.classList.toggle('js-accordion-active');

			if (this.accordionBody?.style.maxHeight) {
				this.accordionBody && (this.accordionBody.style.maxHeight = '');
			} else {
				this.accordionBody && (this.accordionBody.style.maxHeight = this.accordionBody?.scrollHeight + 'px');
			}
		});
	}
}

export function Accordion() {
	const blockClass = '.accordion';
	const ELEMS: NodeListOf<HTMLElement> = document.querySelectorAll(`${blockClass}`);

	ELEMS.forEach((elem) => {
		new AccordionControl(elem, blockClass);
	});
}
