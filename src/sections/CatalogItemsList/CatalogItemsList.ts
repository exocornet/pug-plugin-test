class CatalogItemsListControl {
	block: HTMLElement;
	catalogItemsListContainer: HTMLElement | null;
	catalogItemsListToggle: HTMLElement | null;
	catalogItemsListHeading: HTMLElement | null;
	catalogItemsListLinkControl: HTMLElement | null;
	catalogItemsListLinks: NodeListOf<HTMLElement> | null;

	constructor(block: HTMLElement, classBlock: string) {
		this.block = block;
		this.catalogItemsListHeading = this.block.querySelector(`${classBlock}__lines-heading`);
		this.catalogItemsListContainer = this.block.querySelector(`${classBlock}__content-container`);
		this.catalogItemsListToggle = this.block.querySelector(`${classBlock}__filter-toggle`);
		this.catalogItemsListLinkControl = this.block.querySelector(`${classBlock}__filter-link-control-wrapper`);
		this.catalogItemsListLinks = this.block.querySelectorAll('.filters__link-control');
		// инициализация внутренних методов
		this.#init();
	}

	#init() {
		this.#toggle();
		if (window.screen.width < 768) {
			this.#change();
		}
	}

	#toggle() {
		this.catalogItemsListToggle?.addEventListener('click', () => {
			this.catalogItemsListHeading?.classList.toggle('catalog-items-list__lines-heading_show');
			this.catalogItemsListContainer?.classList.toggle('catalog-items-list__content-container_lines');
		});
	}

	#change() {
		const selectPlaceholder = document.createElement('div');
		selectPlaceholder.classList.add('catalog-items-list__control-div');
		this.catalogItemsListLinkControl?.prepend(selectPlaceholder);

		const controlButton = this.catalogItemsListLinkControl?.querySelector('.catalog-items-list__control-div');
		controlButton &&
			controlButton.addEventListener('click', () => {
				this.catalogItemsListLinkControl?.classList.toggle('catalog-items-list__dropdown');
			});

		this.catalogItemsListLinks?.forEach((link) => {
			link.addEventListener('click', () => {
				this.catalogItemsListLinkControl?.prepend(link);
				this.catalogItemsListLinkControl?.classList.toggle('catalog-items-list__dropdown');
			});
		});
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const blockClass = '.catalog-items-list';
	const element: HTMLElement | null = document.querySelector(`${blockClass}`);
	element && new CatalogItemsListControl(element, blockClass);
});
