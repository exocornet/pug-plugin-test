export class LoadMoreControl {
	private element: HTMLElement | null;
	private moreContainer: ParentNode | null;
	private apiLink: string | null;
	private dataIdComponent: string | null;

	constructor(element: HTMLElement, dataIdComponent: string) {
		this.element = element;
		this.moreContainer = this.element.parentNode;
		this.apiLink = this.element.getAttribute('href');
		this.dataIdComponent = dataIdComponent;

		this.#init();
	}

	#init() {
		this.#linkBind();
	}

	#apiFetch() {
		const URL = `${this.apiLink}`;

		fetch(URL, {
			method: 'GET',
			headers: {
				'X-Requested-With': 'XMLHttpRequest',
				'X-Component': `${this.dataIdComponent}`,
			},
		})
			.then((data) => data.text())
			.then((response) => {
				if (this.moreContainer && this.element) {
					this.element.remove();
					(this.moreContainer as HTMLElement).innerHTML += response;

					this.element = this.moreContainer.querySelector('.js-load-more-button');
					this.apiLink = this.element && this.element.getAttribute('href');

					this.#linkBind();
				}
			})
			.catch((err) => {
				// eslint-disable-next-line no-console
				console.error(err);
			});
	}

	#linkBind() {
		this.element &&
			this.element.addEventListener('click', (e) => {
				e.preventDefault();
				this.element?.classList.add('js-button-preloader');

				this.#apiFetch();
			});
	}

	rebindButton(element: HTMLElement, dataIdComponent: string) {
		this.element = element;
		this.moreContainer = this.element.parentNode;
		this.apiLink = this.element.getAttribute('href');
		this.dataIdComponent = dataIdComponent;

		this.#linkBind();
	}
}
