class ModalCareerGuidance {
	private select: HTMLSelectElement;
	private customSelectItem: NodeListOf<HTMLElement>;
	private datePicker: HTMLElement;
	private events: string | null = null;

	constructor(private readonly section: HTMLElement) {
		this.select = this.section.querySelector('.custom-select select') as HTMLSelectElement;
		this.customSelectItem = this.section.querySelectorAll('.custom-select__item') as NodeListOf<HTMLElement>;
		this.datePicker = this.section.querySelector('.field__container-date-picker') as TDataPicker;
		this.#init();
	}

	#init() {
		this.#addEvents();
		this.customSelectItem.item(0).click();
	}

	#addEvents() {
		this.select.addEventListener('change', (e: Event) => {
			e.preventDefault();
			this.#getDates();
		});
		this.customSelectItem.forEach((item) => {
			item.addEventListener('click', () => {
				if (this.events === item.dataset.eventId) return;
				this.events = item.dataset.eventId ?? '';
				this.select.dispatchEvent(new Event('change'));
			});
		});
	}

	#getDates() {
		if (this.events) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			this.datePicker?.instance.init(this.events);
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const section = document.querySelector('.modal-career-guidance') as HTMLElement;

	section && new ModalCareerGuidance(section);
});
