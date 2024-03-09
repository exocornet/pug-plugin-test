import { useMediaQuery } from '../../shared/helpers/JS/useMediaQuery';

/**
 * Класс, представляющий контроллер раздела.
 * @class
 */
class SectionController {
	private sections: NodeListOf<HTMLElement>;
	private filteredSectionsIncludingId: HTMLElement[];
	private readonly asideListClass: string;

	constructor(asideListClass: string) {
		this.asideListClass = asideListClass;
		this.sections = document.querySelectorAll('section');
		this.filteredSectionsIncludingId = Array.from(this.sections).filter((section) => section.id);
		this.initializeEventListeners();
	}

	/**
	 * Инициализирует прослушиватели событий для документа.
	 * Прослушивает события щелчка и прокрутки.
	 *
	 * @private
	 * @function initializeEventListeners
	 * @returns {void} - Этот метод не возвращает значение.
	 */
	private initializeEventListeners(): void {
		document.addEventListener('click', (event) => this.handleClickEvent(event));
		document.addEventListener('scroll', () => this.handleScrollEvent());
	}

	/**
	 * Прокручивает указанный элемент в поле зрения.
	 *
	 * @param {HTMLElement} target - Элемент, который будет прокручиваться в поле зрения.
	 * @returns {void} - Этот метод не возвращает значение.
	 */
	private scrollElementIntoView(target: HTMLElement): void {
		target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	}

	/**
	 * Активирует данный целевой элемент.
	 *
	 * @param {HTMLElement} target - Целевой элемент для активации.
	 * @returns {void} - Этот метод не возвращает значение.
	 */
	private activateTarget(target: HTMLElement): void {
		const parent = target.closest('.aside-page-nav__list') as HTMLElement;
		const children = parent.querySelectorAll(`.${this.asideListClass}`);

		children.forEach((child) => child.classList.remove(`${this.asideListClass}--active`));

		target.classList.add(`${this.asideListClass}--active`);
	}

	/**
	 * Инициализирует страницу, устанавливая начальный целевой раздел на основе хеша URL-адреса и активируя его.
	 * Также прокручивает целевой раздел в поле зрения.
	 *
	 * @return {void} - Этот метод не возвращает значение.
	 */
	initializePage(): void {
		const hash = location.hash || '#news';
		const initialTarget = document.querySelector(`[href="${hash}"]`) as HTMLElement;
		const targetSection = document.querySelector(hash) as HTMLElement;

		this.activateTarget(initialTarget);
		this.scrollElementIntoView(targetSection);
	}

	/**
	 * Обрабатывает событие щелчка при нажатии целевого элемента.
	 * Если целевой элемент имеет определенный класс, он прокручивает элемент в поле зрения с помощью медиа-запроса.
	 *
	 * @param {Event} event - Событие щелчка.
	 *
	 * @return {void} - Этот метод не возвращает значение.
	 */
	private handleClickEvent(event: Event): void {
		const target = event.target as HTMLElement;

		if (target.classList.contains(this.asideListClass)) {
			useMediaQuery(
				() => this.scrollElementIntoView(target),
				() => {},
				767
			);
		}
	}

	/**
	 * Обрабатывает событие прокрутки, активируя целевой элемент, если он находится в области просмотра.
	 *
	 * @returns {void} - Этот метод не возвращает значение.
	 */
	private handleScrollEvent(): void {
		this.filteredSectionsIncludingId.forEach((section) => {
			if (this.isInViewport(section)) {
				const hash = `#${section.id}`;
				const target = document.querySelector(`[href="${hash}"]`) as HTMLElement;

				this.activateTarget(target);
			}
		});
	}

	/**
	 * Проверяет, находится ли данный элемент в центре области просмотра.
	 *
	 * @param {HTMLElement} element - Элемент, который нужно проверить, находится ли он в области просмотра.
	 *
	 * @return {boolean} - True, если элемент находится в области просмотра, в противном случае — false.
	 */
	private isInViewport(element: HTMLElement): boolean {
		const rect = element.getBoundingClientRect();
		const windowHeight = window.innerHeight || document.documentElement.clientHeight;
		const windowWidth = window.innerWidth || document.documentElement.clientWidth;
		const vertInView = rect.top <= windowHeight / 2 && rect.top + rect.height >= windowHeight / 2;
		const horInView = rect.left <= windowWidth / 2 && rect.left + rect.width >= windowWidth / 2;

		return vertInView && horInView;
	}
}
document.addEventListener('DOMContentLoaded', () => {
	const sectionController = new SectionController('aside-page-nav__item');
	sectionController.initializePage();
});
