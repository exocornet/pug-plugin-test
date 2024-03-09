import { ClassDebounce } from '../../shared/helpers/JS/useDebounce';
import { LoadMoreControl, SelectFilter, SelectFilterControl } from '../../shared';
import SelectFilterHTML from '../../shared/ui/SelectFilter/SelectFilter.js.pug';

class FiltersControl {
	block: HTMLElement;
	dataIdComponent: string;
	elementSearch: HTMLInputElement | null;
	elementLinkControlArr: NodeListOf<HTMLElement>;
	elementSelectControlArr: NodeListOf<HTMLElement>;
	elementSelectButtonClear: HTMLLinkElement | null;
	elementContentContainer: HTMLLinkElement | null;
	elementSelectWrapper: HTMLLinkElement | null;
	elementLoadMoreButton: HTMLElement | null;
	loadMoreButtonControl: LoadMoreControl | null;
	selectFilterControlArray: Array<SelectFilterControl>;

	constructor(block: HTMLElement, blockClass: string) {
		this.block = block;
		this.selectFilterControlArray = SelectFilter();
		this.dataIdComponent = this.block.dataset.idComponent || '';
		this.elementSearch = this.block.querySelector(`${blockClass}__search`);
		this.elementLinkControlArr = this.block.querySelectorAll(`${blockClass}__link-control`);
		this.elementContentContainer = this.block.querySelector(`${blockClass}__content-container`);
		this.elementSelectWrapper = this.block.querySelector(`${blockClass}__select-wrapper`);
		this.elementSelectControlArr = this.block.querySelectorAll('.choices');
		this.elementSelectButtonClear = this.block.querySelector(`${blockClass}__select-button-clear`);
		this.elementLoadMoreButton = this.block.querySelector('.js-load-more-button');

		// кнопка подгрузки контента
		this.loadMoreButtonControl = this.elementLoadMoreButton
			? new LoadMoreControl(this.elementLoadMoreButton, this.dataIdComponent)
			: null;

		// инициализация внутренних методов
		this.#init();
	}

	#init() {
		this.#search();
		this.#linkControl();
		this.#resetSelectAll();
		this.#selectControl(this.elementSelectControlArr);
	}

	#apiFetch(pathname: string) {
		let urlFetch = new URL(window.location.href).pathname;

		pathname && (urlFetch = `${pathname}`);
		// изменение URL в адресной строке браузера
		window.history.pushState({}, '', urlFetch);

		fetch(urlFetch, {
			method: 'GET',
			headers: {
				'X-Requested-With': 'XMLHttpRequest',
				'X-Component': this.dataIdComponent,
			},
		})
			.then((data) => data.text())
			.then((response) => {
				if (this.elementContentContainer) {
					this.elementContentContainer.innerHTML = response;
					this.elementContentContainer.classList.remove('js-filters-preloader');

					//rebind more button
					this.elementLoadMoreButton = this.block.querySelector('.js-load-more-button');
					this.elementLoadMoreButton &&
						this.loadMoreButtonControl?.rebindButton(this.elementLoadMoreButton, this.dataIdComponent);
				}
			})
			.catch((err) => {
				// eslint-disable-next-line no-console
				console.error(err);
			});
	}

	#requestSelectApi(url: string) {
		fetch(url)
			.then((data) => data.json())
			.then((response) => {
				let SELECT_ARR: NodeListOf<HTMLElement> = this.block.querySelectorAll('.choices');

				SELECT_ARR.forEach((select) => {
					select.remove();
				});

				response.forEach((item: { name: string; title: string; options: [] }) => {
					const OPTION_ARR: object[] = [];
					item?.options.forEach((option: { value: string; title: string }) => {
						OPTION_ARR.push({
							data: {
								value: option.value,
								text: option.title,
							},
						});
					});

					const data = {
						data: {
							nameSelect: item.name,
							text: item.title,
						},
						dataArr: {
							optionArr: OPTION_ARR,
						},
					};

					this.elementSelectWrapper?.insertAdjacentHTML('afterbegin', SelectFilterHTML({ data }));
				});

				this.selectFilterControlArray = SelectFilter();
				SELECT_ARR = this.block.querySelectorAll('.choices');
				this.#selectControl(SELECT_ARR);
			})
			// eslint-disable-next-line no-console
			.catch((err) => console.error(err));
	}

	#search() {
		const searchResponse = (actionFormSearch: string) => {
			this.elementContentContainer?.classList.add('js-filters-preloader');
			this.#apiFetch(actionFormSearch);
		};

		const searchDebounce = new ClassDebounce<string>(searchResponse);

		this.elementSearch?.addEventListener('input', (e) => {
			searchDebounce.clearTimer();
			const SEARCH_TARGET = e.target as HTMLInputElement;

			if (SEARCH_TARGET.value.length > 2) {
				const urlSearch = new URL(window.location.href);
				urlSearch.searchParams.set(`${this.elementSearch?.name}`, SEARCH_TARGET.value);

				searchDebounce.setTimer(urlSearch.href);
			} else if (SEARCH_TARGET.value.length === 0) {
				this.elementContentContainer?.classList.add('js-filters-preloader');

				const urlSearch = new URL(window.location.href);
				urlSearch.searchParams.delete(`${this.elementSearch?.name}`);

				this.#apiFetch(urlSearch.href);
			}
		});
	}

	#handlerClickLinkControl = (e: MouseEvent) => {
		const LINK_CONTROL_CURRENT_TARGET = e.currentTarget as HTMLElement;
		// очищение поисковой строки при выборе фильтра
		if (this.elementSearch) {
			this.elementSearch.value = '';
		}
		// снятие выбранных селект-фильтров
		this.#clearSelect();
		// горизонтальный подскролл при нажатии на выбранный фильтр
		LINK_CONTROL_CURRENT_TARGET.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
		// перебор всех фильтров в виде табов и снятия с них активного стиля
		this.elementLinkControlArr.forEach((linkControl) => {
			linkControl.classList.remove('js-active-filters-link-control');
		});
		// добавление активного стиля на выбранный фильтр
		LINK_CONTROL_CURRENT_TARGET.classList.add('js-active-filters-link-control');
		// получение атрибута href выбранного фильтра для формирования URL запроса
		const getAttrHref = LINK_CONTROL_CURRENT_TARGET.getAttribute('href') || '';
		// показать прелоадер в подгрузке контентной части при выборе фильтра
		this.elementContentContainer?.classList.add('js-filters-preloader');
		// вызов функции запроса API для получения контентной части
		this.#apiFetch(getAttrHref);
		LINK_CONTROL_CURRENT_TARGET.dataset.tabSelect &&
			this.#requestSelectApi(`${LINK_CONTROL_CURRENT_TARGET.dataset.tabSelect}`);
		// перебор всех фильтров в виде табов и навешивание обработчика клика
		this.elementLinkControlArr.forEach((LinkControl: HTMLElement | null) => {
			// навешивание обработчика по нажатию на фильтр
			LinkControl?.addEventListener('click', this.#handlerClickLinkControl);
		});
		// удаление обработчика на нажатый фильтр
		LINK_CONTROL_CURRENT_TARGET.removeEventListener('click', this.#handlerClickLinkControl);
	};

	#linkControl() {
		// перебор всех фильтров в виде табов и навешивание обработчика клика
		this.elementLinkControlArr.forEach((LinkControl) => {
			// навешивание обработчика по нажатию на фильтр
			LinkControl.addEventListener('click', this.#handlerClickLinkControl);
			// отмена стандартного поведения ссылки фильтра
			LinkControl.addEventListener('click', (e) => e.preventDefault());
		});
	}

	#selectControl(selectArr: NodeListOf<HTMLElement>) {
		selectArr.forEach((select) => {
			select.querySelector('.choices__button')?.addEventListener('mousedown', () => {
				const urlSelect = new URL(window.location.href);
				urlSelect.searchParams.delete((select.querySelector('select') as HTMLSelectElement).name);
				// показать прелоадер в подгрузке контентной части при удаление фильтра
				this.elementContentContainer?.classList.add('js-filters-preloader');

				this.#apiFetch(urlSelect.href);
			});

			select.addEventListener('click', () => {
				const selectOptionArr = select.querySelectorAll('[role="option"]');
				const selectName = (select.querySelector('select') as HTMLSelectElement).name;

				selectOptionArr.forEach((selectOption, idx) => {
					if (idx !== 0) {
						selectOption.addEventListener('mousedown', (e) => {
							const selectButtonClear = select.querySelector('.choices__button');

							const urlSelect = new URL(window.location.href);
							urlSelect.searchParams.set(selectName, `${(e.currentTarget as HTMLElement).dataset.value}`);

							selectButtonClear?.addEventListener('mousedown', () => {
								const urlSelect = new URL(window.location.href);
								urlSelect.searchParams.delete(selectName);
								// показать прелоадер в подгрузке контентной части при удаление фильтра
								this.elementContentContainer?.classList.add('js-filters-preloader');

								this.#apiFetch(urlSelect.href);
							});
							// показать прелоадер в подгрузке контентной части при выборе фильтра
							this.elementContentContainer?.classList.add('js-filters-preloader');

							this.#apiFetch(urlSelect.href);
						});
					}
				});
			});
		});
	}

	#resetSelectAll() {
		this.elementSelectButtonClear?.addEventListener('click', () => {
			this.#clearSelect();

			const urlSelect = new URL(window.location.href);
			this.elementContentContainer?.classList.add('js-filters-preloader');
			this.#apiFetch(urlSelect.pathname);
		});
	}

	#clearSelect() {
		this.selectFilterControlArray.forEach((selectFilterControl) => {
			selectFilterControl.clearChoices();
		});
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const blockClass = '.filters';
	const ELEMS: NodeListOf<HTMLElement> = document.querySelectorAll(`${blockClass}`);
	ELEMS.forEach((element: HTMLElement | null) => {
		element && new FiltersControl(element, blockClass);
	});
});
