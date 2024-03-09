import useTemplate from '../../shared/helpers/JS/useTemplate';
import SearchResultProduct from '../../features/SearchResultProduct/SearchResultProduct.pug';
import SearchResult from '../../features/SearchResult/SearchResult.pug';

interface IResponse {
	status: number;
	groups: IResponseGroup[];
	pagination: {
		totalRecords: number;
		totalPages: number;
		pageCount: number;
		pageSize: number;
		currentPageNumber: number;
	};
	sections: [
		{
			id: number;
			name: string;
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

class SearchControl {
	block: HTMLElement;
	searchInput: HTMLInputElement | null;
	searchButtonClear: HTMLElement | null;
	searchWrapHistory: HTMLElement | null;
	searchWrapTop: HTMLElement | null;
	searchFrequentQueries: HTMLElement | null;
	searchPromotionalProducts: HTMLElement | null;
	searchResult: HTMLElement | null;
	searchWrapButtonResult: HTMLElement | null;
	searchWrapResult: HTMLElement | null;
	searchWrapPagination: HTMLElement | null;
	timeout: NodeJS.Timeout;

	constructor(block: HTMLElement, blockClass: string) {
		this.block = block;
		this.searchInput = this.block.querySelector(`${blockClass}__input`);
		this.searchButtonClear = this.block.querySelector(`${blockClass}__button-clear`);
		this.searchWrapHistory = this.block.querySelector(`${blockClass}__wrap-history`);
		this.searchWrapTop = this.block.querySelector(`${blockClass}__wrap-top`);
		this.searchFrequentQueries = this.block.querySelector(`${blockClass}__frequent-queries`);
		this.searchPromotionalProducts = this.block.querySelector(`${blockClass}__promotional-products`);
		this.searchResult = this.block.querySelector(`${blockClass}__result`);
		this.searchWrapButtonResult = this.block.querySelector(`${blockClass}__wrap-button-result`);
		this.searchWrapResult = this.block.querySelector(`${blockClass}__wrap-result`);
		this.searchWrapPagination = this.block.querySelector(`${blockClass}__wrap-pagination`);

		// вызов метода инициализации класса
		this.#init();
	}

	#init() {
		this.#responseSearchHistoryAndPopular('/api/search/history/', this.searchWrapHistory);
		this.#responseSearchHistoryAndPopular('/api/search/top/', this.searchWrapTop);
		this.#searchEvents();
	}

	/**
	 * Добавляет обработчики событий.
	 * @private
	 */
	#searchEvents(): void {
		// при нажатии на Esc стираем поисковую строку
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				this.searchInput && (this.searchInput.value = '');
				this.#responseSearch();
			}
		});

		window.addEventListener('load', () => {
			this.searchInput && (this.searchInput.value = '');
			this.#responseSearch();
		});

		this.searchInput?.addEventListener('input', () => {
			this.#responseSearch();
		});

		this.searchButtonClear?.addEventListener('click', () => {
			this.searchInput && (this.searchInput.value = '');
			this.#responseSearch();
		});
	}

	#apiFetch(
		callback: (response: IResponse) => void,
		q: string | undefined,
		sectionId: number = 0,
		pageNumber: number = 1
	) {
		fetch(`/api/search/result/?full=1&q=${q}&sectionId=${sectionId}&pageNumber=${pageNumber}`, {
			method: 'GET',
			headers: {
				'X-Requested-With': 'XMLHttpRequest',
			},
		})
			.then((data) => data.json())
			.then((response) => {
				callback(response);
			})
			.catch((err) => {
				// eslint-disable-next-line no-console
				console.error(err);
			});
	}

	#responseSearch() {
		clearTimeout(this.timeout);

		// если в инпуте что-то есть, то показываем крестик
		if (this.searchInput?.value.length) {
			this.searchButtonClear?.classList.remove('d-none');
		} else {
			this.searchButtonClear?.classList.add('d-none');
		}

		// если в инпуте больше двух символов, то ждем 500мс и делаем запрос
		if (this.searchInput && this.searchInput.value.length > 2) {
			this.timeout = setTimeout(() => {
				const renderHtml = (response: IResponse) => {
					this.#renderButtonResult(response);
					this.#renderSearchResult(response);
					this.#renderButtonPagination(response);
				};
				this.#apiFetch(renderHtml.bind(this), this.searchInput?.value);
			}, 250);
		} else {
			[this.searchFrequentQueries, this.searchPromotionalProducts].forEach((elem) => {
				elem?.classList.remove('d-none');
			});

			if (this.searchResult) {
				this.searchResult.classList.add('d-none');
			}
		}
	}

	#renderSearchResult(response: IResponse) {
		// скрываем при запросе поиска
		[this.searchFrequentQueries, this.searchPromotionalProducts].forEach((elem) => {
			elem?.classList.add('d-none');
		});

		// показываем результаты поиска
		if (this.searchResult) {
			this.searchResult.classList.remove('d-none');
		}

		// отрисовка результатов поиска
		let htmlSearchResult = '';
		response?.groups.forEach((group: IResponseGroup) => {
			if (group.sectionCode === 'catalog') {
				htmlSearchResult += SearchResultProduct({ data: group });
			} else {
				htmlSearchResult += SearchResult({ data: group });
			}
		});

		if (this.searchWrapResult) {
			this.searchWrapResult.innerHTML = '';
			this.searchWrapResult.insertAdjacentHTML('afterbegin', htmlSearchResult);
		}
	}

	#renderButtonResult(response: IResponse) {
		// очищаем блок/врапер для кнопки по категориям
		this.searchWrapButtonResult && (this.searchWrapButtonResult.innerHTML = '');
		// добавляем данные в клон шаблона кнопки и добавляем клон шаблона кнопки в блок/врапер
		response.sections.forEach((dataButton, idx) => {
			// клонируем шаблон кнопки по категориям
			const cloneTemplate = useTemplate('search-button-result', this.block);
			const buttonTemplate: HTMLButtonElement | null = cloneTemplate.querySelector('.button');
			if (buttonTemplate) {
				// приводим к одному виду все кнопки
				buttonTemplate.classList.add('button_transparent');
				// делаем активную кнопку
				if (idx === 0) {
					buttonTemplate.classList.add('js-active-button-section');
					buttonTemplate.classList.remove('button_transparent');
				}
				// сохраняем id sections
				buttonTemplate.setAttribute('data-id-sections', `${dataButton.id}`);
				// меняем надпись кнопки
				buttonTemplate.innerHTML = `${dataButton.name} [${dataButton.count}]`;
				// добавляем обработчик события на кнопку
				buttonTemplate.addEventListener('click', (e) => {
					// очищаем неактивную кнопку
					this.searchWrapButtonResult?.querySelectorAll('.button').forEach((elem) => {
						if (elem.classList.contains('js-active-button-section')) {
							elem.classList.add('button_transparent');
							elem.classList.remove('js-active-button-section');
						}
					});
					// делаем активную кнопку
					(e.currentTarget as HTMLButtonElement).classList.add('js-active-button-section');
					(e.currentTarget as HTMLButtonElement).classList.remove('button_transparent');
					(e.currentTarget as HTMLButtonElement).scrollIntoView({
						inline: 'center',
						block: 'nearest',
						behavior: 'smooth',
					});
					// отправляем запрос
					this.#apiFetch(this.#renderSearchResult.bind(this), this.searchInput?.value, dataButton.id);
				});
			}
			this.searchWrapButtonResult?.appendChild(cloneTemplate);
		});
	}

	#renderButtonPagination(response: IResponse) {
		// очищаем блок/врапер для кнопки по категориям
		this.searchWrapPagination && (this.searchWrapPagination.innerHTML = '');
		// добавляем данные в клон шаблона кнопки и добавляем клон шаблона кнопки в блок/врапер
		for (let i = 1; i <= response.pagination.totalPages; i++) {
			// клонируем шаблон кнопки по категориям
			const cloneTemplate = useTemplate('search-button-result', this.block);
			const buttonTemplate: HTMLButtonElement | null = cloneTemplate.querySelector('.button');
			if (buttonTemplate) {
				buttonTemplate.classList.add('button_transparent');
				// делаем активную кнопку
				if (i === 1) {
					buttonTemplate.classList.remove('button_transparent');
				}
				buttonTemplate.innerHTML = `${i}`;
				buttonTemplate.addEventListener('click', (e) => {
					// очищаем неактивную кнопку
					this.searchWrapPagination?.querySelectorAll('.button').forEach((elem) => {
						if (!elem.classList.contains('button_transparent')) {
							elem.classList.add('button_transparent');
						}
					});
					// делаем активную кнопку
					(e.currentTarget as HTMLButtonElement).classList.remove('button_transparent');

					const idSections = (
						this.searchWrapButtonResult?.querySelector('.js-active-button-section') as HTMLButtonElement
					)?.dataset.idSections;
					this.#apiFetch(this.#renderSearchResult.bind(this), this.searchInput?.value, Number(idSections), i);
				});
			}
			this.searchWrapPagination?.appendChild(cloneTemplate);
		}
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
					const cloneTemplate = useTemplate('search-button-history-popular', this.block);
					if (cloneTemplate) {
						const buttonTemplate: HTMLButtonElement | null = cloneTemplate.querySelector('button');

						buttonTemplate?.addEventListener('click', (e) => {
							const buttonText = (e?.target as HTMLElement)?.textContent;
							this.searchInput && (this.searchInput.value = buttonText!.toLowerCase());

							if (this.searchInput?.value.length) {
								this.searchButtonClear?.classList.remove('d-none');
								this.#responseSearch();
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
}

document.addEventListener('DOMContentLoaded', () => {
	const blockClass: string = '.search';
	const element: HTMLElement | null = document.querySelector(`${blockClass}`);
	element && new SearchControl(element, blockClass);
});
