import { More, Tabs } from '../../shared';

class FilterPurchase {
	private items: NodeListOf<HTMLElement>;
	private tabs: HTMLElement | null;
	private observer: MutationObserver;
	private readonly filterContainer: HTMLElement;
	private modal: IModal;

	constructor(private readonly section: HTMLElement) {
		this.items = this.section.querySelectorAll('.filter-purchase__item');
		this.tabs = this.section.querySelector('.tabs');
		this.filterContainer = this.section.querySelector('.filter-purchase__container') as HTMLElement;
		this.modal = document.querySelector('.modal-procurement .modal') as IModal;

		this.observer = new MutationObserver((mutationList) => this.#observerCallback(mutationList));
		this.observer.observe(this.filterContainer, { childList: true });
		this.#addEvents();
	}

	#addEvents() {
		(this.section.querySelectorAll('.filter-purchase__item') as NodeListOf<HTMLElement>).forEach((item) => {
			item.addEventListener('click', () => this.#itemToggle(item));
		});

		document.querySelectorAll('a[href="#modal-procurement"]')?.forEach((item) => {
			item?.addEventListener('click', (event) => {
				event.preventDefault();
				event.stopPropagation();
				this.modal.modalInstance.show(item as HTMLElement);
			});
		});
	}

	#itemToggle(item: HTMLElement) {
		item.classList.toggle('js-item-open');
	}

	#observerCallback(mutationList: MutationRecord[]) {
		for (const mutation of mutationList) {
			if (mutation.addedNodes.length) {
				this.#addEvents();
				Tabs('.tabs');
				More();
			}
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const section = document.querySelector('.filter-purchase');

	if (section) {
		new FilterPurchase(section as HTMLElement);
	}
});
