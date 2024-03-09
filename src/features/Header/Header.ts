import { fadeIn, fadeOut } from '../../shared/helpers/JS/animateBlock';
import getBoundingClientRect from '@popperjs/core/lib/dom-utils/getBoundingClientRect';
import SearchResult from '../SearchResult/SearchResult.pug';
import SearchResultProduct from '../SearchResultProduct/SearchResultProduct.pug';
import useTemplate from '../../shared/helpers/JS/useTemplate';

interface IResponse {
	status: number;
	groups: IResponseGroup[];
	sections: [
		{
			id: number;
			name: {
				ru: string;
				en: string;
				cn: string;
			};
			count: number;
		}
	];
}

interface IResponseGroup {
	sectionCode: string;
	elements: IResponseGroupElement[];
}

interface IResponseGroupElement {
	id: number;
	title: string;
	body: string;
	detailPageUrl: string;
	iblockId: number;
	tags: null;
}

/**
 * Класс HeaderControl управляет поведением HEADER'а страницы.
 */
class HeaderControl {
	/**
	 * Элемент заголовка страницы.
	 */
	header: HTMLElement;
	/**
	 * Кнопка бургера для открытия/закрытия меню.
	 */
	burgerButton: HTMLElement;
	/**
	 * Меню заголовка страницы.
	 */
	headerMenu: HTMLElement;
	/**
	 * Меню выбора языка.
	 */
	langsMenu: HTMLElement;
	/**
	 * Кнопка выбора языка.
	 */
	langButton: HTMLElement;
	/**
	 * Мобильные ссылки меню заголовка страницы.
	 */
	headerLinksMobile: HTMLElement;
	/**
	 * Навигация заголовка страницы.
	 */
	headerNavigation: HTMLElement;
	/**
	 * Поле ввода поиска в заголовке страницы.
	 */
	headerSearchInput: HTMLInputElement;
	/**
	 * Кнопка очистки поля ввода поиска.
	 */
	headerSearchButtonClear: HTMLElement;
	/**
	 * Скрытые блоки, которые отображаются при поиске.
	 */
	hiddenBlocks: NodeListOf<Element>;
	/**
	 * Идентификатор анимации открытия меню.
	 */
	openFrame: number | null;
	/**
	 * Идентификатор анимации закрытия меню.
	 */
	closeFrame: number | null;
	/**
	 * Скорость анимации меню.
	 */
	speed: number = 0;
	/**
	 * Таймаут для задержки запроса при вводе в поле поиска.
	 */
	timeout: NodeJS.Timeout;
	searchedHistory: HTMLElement | null;
	searchedPopular: HTMLElement | null;
	headerSearchResult: HTMLElement | null;

	/**
	 * Создает экземпляр класса HeaderControl.
	 * @param elem - основной элемент HEADER'а страницы (блок).
	 */
	constructor(elem: HTMLElement) {
		this.header = elem;
		this.langButton = this.header.querySelector('.header__lang-button') as HTMLElement;
		this.langsMenu = this.header.querySelector('.header__langs-menu') as HTMLElement;
		this.burgerButton = this.header.querySelector('.header__burger-button') as HTMLElement;
		this.headerMenu = this.header.querySelector('.header__menu') as HTMLElement;
		this.headerLinksMobile = this.header.querySelector('.header__menu-links') as HTMLElement;
		this.headerNavigation = this.header.querySelector('.header__navigation') as HTMLElement;
		this.headerSearchInput = this.header.querySelector('.header__search-input') as HTMLInputElement;
		this.headerSearchButtonClear = document.querySelector('.header__search-button-clear') as HTMLElement;
		this.searchedHistory = this.header.querySelector('[data-url-search-history]');
		this.searchedPopular = this.header.querySelector('[data-url-search-popular]');
		this.headerSearchResult = document.querySelector('.header__search-result');

		// вызов метода инициализации класса
		this.#init();
	}

	/**
	 * Инициализация класса HeaderControl.
	 * Применяет начальные настройки и добавляет обработчики событий.
	 * @private
	 */
	#init(): void {
		// работа с меню выбора языка
		this.#handlerLangMenu();
		// убираем меню с десктопа в бургер меню после 1599px
		this.#handlerMenu();
		this.#widthResize();
		// получение
		this.#responseSearchHistoryAndPopular('/api/search/history/', this.searchedHistory);
		this.#responseSearchHistoryAndPopular('/api/search/top/', this.searchedPopular);
		//
		this.#addEvents();

		this.#createCssVarHeader();
	}

	#createCssVarHeader() {
		const resize = () => {
			const heightHeader = this.header.scrollHeight;
			// Установка значения CSS переменной
			document.documentElement.style.setProperty('--header-height', `${heightHeader}px`);
		};

		resize();

		window.addEventListener('resize', resize);
	}

	/**
	 * Обработчик клика на кнопку выбора языка.
	 * Открывает/закрывает меню выбора языка.
	 * Закрывает меню выбора языка при клике вне его области.
	 * @private
	 */
	#handlerLangMenu(): void {
		document.addEventListener('click', (event) => {
			const target = event.target as HTMLElement;
			if (!target.classList.contains('header__lang-button') && !target.closest('.header__lang-button')) {
				this.langsMenu.classList.remove('js-open-langs-menu');
			}
		});

		// Обработчик клика на кнопку выбора языка. Открывает/закрывает меню выбора языка.
		this.langButton.addEventListener(
			'click',
			() => this.langsMenu && this.langsMenu.classList.toggle('js-open-langs-menu')
		);

		// Обработчик клика на элемент меню выбора языка. Меняет выбранный язык и текст кнопки выбора языка.
		this.langsMenu.addEventListener('click', (e) => {
			if (this.langButton) {
				const target: HTMLElement = (e.target as HTMLElement)!;
				const buttonDataLang: string = this.langButton.dataset.lang!;
				this.langButton.setAttribute('data-lang', target.dataset.lang!);
				this.langButton.innerText = target.dataset.lang!;
				target.setAttribute('data-lang', buttonDataLang);
				target.innerText = buttonDataLang;
			}
		});
	}

	/**
	 * Обработчик клика на кнопку бургер-меню.
	 * Открывает/закрывает меню и прокручивает страницу вверх.
	 * @private
	 */
	#handlerMenu(): void {
		this.burgerButton.addEventListener('click', () => {
			window.scrollTo({
				top: 0,
				left: 0,
				behavior: 'smooth',
			});

			this.header && this.header.classList.toggle('js-open-burger-menu');
			window.cancelAnimationFrame(this.openFrame!);
			window.cancelAnimationFrame(this.closeFrame!);
			this.speed = Math.trunc(window.innerHeight / 20);
			if (this.headerMenu) {
				if (this.header?.classList.contains('js-open-burger-menu')) {
					this.headerMenu!.classList.remove('js-searching', 'js-menu-show-links');
					document.documentElement.classList.add('overflow-hidden');
					[...this.headerNavigation!.children!].forEach((item) => {
						(item as HTMLElement).style.top = '0';
					});
					const boundHeader = getBoundingClientRect(this.header!);
					const height =
						window.innerHeight - boundHeader.height + parseInt(getComputedStyle(this.header!).paddingBottom);
					fadeIn(this.headerMenu!, 200, height);
					this.headerMenu.style.overflow = 'auto';
				} else {
					document.documentElement.classList.remove('overflow-hidden');
					this.headerMenu.style.overflow = 'hidden';
					[...this.headerNavigation!.children!].forEach((item) => {
						(item as HTMLElement).style.top = '-32px';
					});
					fadeOut(this.headerMenu!, 200);
				}
			}
		});
	}

	/**
	 * Перемещает ссылки меню на мобильной версии в зависимости от ширины окна.
	 * @private
	 */
	#widthResize() {
		if (window.innerWidth > 1599) {
			this.headerNavigation!.prepend(this.headerLinksMobile!);
		} else {
			this.headerMenu!.querySelector('.container')!.prepend(this.headerLinksMobile!);
		}
	}

	/**
	 * Добавляет обработчики событий.
	 * @private
	 */
	#addEvents(): void {
		// при нажатии на Esc стираем поисковую строку
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				this.headerMenu.classList.remove('js-searching');
				this.headerSearchInput.value = '';
				this.#responseSearch();
			}
		});

		this.headerMenu.addEventListener('click', (e) => {
			const element = e.target as HTMLElement;
			const classes = ['header__menu', 'container', 'row', 'col'];
			classes.some((className) => element.classList.contains(className)) &&
				this.headerMenu.classList.remove('js-searching');
		});

		this.headerSearchInput.addEventListener('click', () => {
			this.headerMenu.classList.add('js-searching');
		});

		window.addEventListener('load', () => {
			this.headerSearchInput.value = '';
			this.#responseSearch();
		});

		this.headerSearchInput.addEventListener('input', () => {
			this.#responseSearch();
		});

		this.headerSearchButtonClear.addEventListener('click', () => {
			this.headerSearchInput.value = '';
			this.#responseSearch();
		});
	}

	/**
	 * Отправляет запрос к бэкэнду и отрисовывает результаты поиска.
	 * @private
	 */
	#responseSearchHistoryAndPopular(url: string, block: HTMLElement | null) {
		fetch(url)
			.then((data) => data.json())
			.then((response) => {
				response.data.forEach((text: string) => {
					const cloneTemplate = useTemplate('search-button-history-popular', this.header);
					if (cloneTemplate) {
						const buttonTemplate: HTMLButtonElement | null = cloneTemplate.querySelector('button');

						buttonTemplate?.addEventListener('click', (e) => {
							const buttonText = (e?.target as HTMLElement)?.textContent;
							this.headerSearchInput.value = buttonText!.toLowerCase();

							if (this.headerSearchInput.value.length) {
								this.headerSearchButtonClear.classList.remove('d-none');
							} else {
								this.headerSearchButtonClear.classList.add('d-none');
							}
						});
						buttonTemplate && (buttonTemplate.textContent = text);
						block?.appendChild(cloneTemplate);
					}
				});
			})
			// eslint-disable-next-line no-console
			.catch((err) => console.error(err));
	}

	/**
	 * Читает данные из URL и отображает результаты поиска.
	 * @private
	 */
	#responseSearch() {
		clearTimeout(this.timeout);

		// если в инпуте что-то есть, то показываем крестик
		if (this.headerSearchInput.value.length) {
			this.headerSearchButtonClear.classList.remove('d-none');
		} else {
			this.headerSearchButtonClear.classList.add('d-none');
		}

		// если в инпуте больше двух символов, то ждем 500мс и делаем запрос
		if (this.headerSearchInput.value.length > 2) {
			this.timeout = setTimeout(() => {
				fetch(`/api/search/result/?q=${this.headerSearchInput.value}`)
					.then((data) => data.json())
					.then((response) => {
						this.#renderText(response);
					})
					.catch((err) => {
						// eslint-disable-next-line no-console
						console.error(err);
					});
			}, 500);
		} else {
			document.querySelectorAll('.js-menu-search-main')!.forEach((item) => ((item as HTMLElement).style.display = ''));
			if (this.headerSearchResult) {
				this.headerSearchResult.classList.remove('d-flex');
				this.headerSearchResult.classList.add('d-none');
			}
		}
	}

	/**
	 * Отрисовывает результаты поиска.
	 * @param response - массив с данными результатов поиска
	 * @private
	 */
	#renderText(response: IResponse): void {
		// скрываем при запросе поиска
		document
			.querySelectorAll('.js-menu-search-main')!
			.forEach((item) => ((item as HTMLElement).style.display = 'none'));

		// показываем результаты поиска
		if (this.headerSearchResult) {
			this.headerSearchResult.classList.remove('d-none');
			this.headerSearchResult.classList.add('d-flex');

			// блок/врапер для кнопки по категориям
			const block: Element | null = document.querySelector('.js-button-wrapper');
			// очищаем блок/врапер для кнопки по категориям
			block && (block.innerHTML = '');
			// добавляем данные в клон шаблона кнопки и добавляем клон шаблона кнопки в блок/врапер
			response.sections.forEach((dataButton) => {
				// клонируем шаблон кнопки по категориям
				const cloneTemplate = useTemplate('search-button-result', this.header);
				const buttonTemplate: HTMLButtonElement | null = cloneTemplate.querySelector('.button');
				buttonTemplate && (buttonTemplate.innerHTML = `${dataButton.name} [${dataButton.count}]`);
				block?.appendChild(cloneTemplate);
			});
		}

		// отрисовка результатов поиска
		let html = '';
		response?.groups.forEach((group: IResponseGroup) => {
			if (group.sectionCode === 'catalog') {
				group = Object.assign(group, { cn: { colorTheme: 'grey' }, opt: { isPrice: true } });
				html += SearchResultProduct({ data: group });
			} else {
				group = Object.assign(group, { cn: { colorSearchResultTheme: 'grey' } });
				html += SearchResult({ data: group });
			}
		});
		(document.querySelector('.js-search') as HTMLElement).innerHTML = html;
	}
}

/**
 * Функция Header инициализирует класс HeaderControl для элемента заголовка страницы.
 */
export function Header() {
	const elem = document.querySelector('.header') as HTMLElement;
	if (elem) {
		new HeaderControl(elem);
	}
}
