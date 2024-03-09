class NavTabsControl {
	private readonly menuLinks: NodeListOf<HTMLElement>;
	private backButtons: NodeListOf<HTMLElement>;
	private menuNavTabs: HTMLElement;
	private menuPageLinks: NodeListOf<HTMLElement>;
	private menu: HTMLElement;

	constructor(menuNavTabs: HTMLElement) {
		this.menuNavTabs = menuNavTabs;
		this.menu = document.querySelector('.header__menu') as HTMLElement;
		this.menuLinks = this.menuNavTabs.querySelectorAll('.nav-tabs__link');
		this.menuPageLinks = this.menuNavTabs.querySelectorAll('.nav-tabs__page-link') as NodeListOf<HTMLElement>;
		this.backButtons = document.querySelectorAll('.nav-tabs__back') as NodeListOf<HTMLElement>;
		this.#init();
	}

	#init(): void {
		this.#addEvents();
		this.#hideLinks();
	}

	#addEvents() {
		this.menuLinks.forEach((item) => {
			(item as HTMLElement).addEventListener('click', (e) => this.#menuPageHandler(e));
		});
		this.backButtons.length &&
			this.backButtons.forEach((item) => {
				item.addEventListener('click', () => {
					this.menu.classList.remove('js-menu-show-links');
				});
			});
	}

	#menuPageHandler(event: MouseEvent): void {
		event.preventDefault();
		const target: HTMLElement = event.target as HTMLElement;
		const button = (target.classList.contains('button') ? target : target.parentNode) as HTMLElement;
		this.#hideLinks();
		const dataNavBtn = button.dataset.navTabsButton;

		if (window.innerWidth < 768) {
			this.#showLinks(dataNavBtn);
			const menu = document.querySelector('.header__menu') as HTMLElement;
			menu.classList.add('js-menu-show-links');
		} else {
			if (button.classList.contains('js-nav-tabs-button-selected')) {
				button.classList.remove('js-nav-tabs-button-selected');
			} else {
				[...this.menuLinks].forEach((item) => {
					item.classList.remove('js-nav-tabs-button-selected');
				});
				button.classList.add('js-nav-tabs-button-selected');
				this.#showLinks(dataNavBtn);
			}
		}
	}

	#showLinks(name: string | undefined): void {
		if (!name) return;
		const pageLinks = document.querySelector(`.nav-tabs__page-link[data-nav-tabs-links=${name}]`) as HTMLElement;
		if (pageLinks) pageLinks.style.display = '';
	}

	#hideLinks() {
		document.querySelectorAll('.nav-tabs__page-link').forEach((item) => {
			(item as HTMLElement).style.display = 'none';
		});
	}
}

export function NavTabs() {
	const MENU_NAV_TABS = document.querySelector('.nav-tabs') as HTMLElement;
	if (MENU_NAV_TABS) {
		new NavTabsControl(MENU_NAV_TABS);
	}
}
