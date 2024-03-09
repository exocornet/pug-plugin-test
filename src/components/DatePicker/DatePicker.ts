import { HTTPRequest } from '../../shared/helpers/JS/API';

type TResponse = {
	status: boolean;
	data: { [key: string]: string[] };
};

class DatePicker {
	private data: TResponse['data'];
	private readonly datePicker: HTMLElement | null;
	private readonly dateItems: HTMLElement | null;
	private readonly timeItems: HTMLElement | null;
	private readonly input: HTMLInputElement | null;
	private times: string[] | [];
	date: string = '';
	time: string = '';
	private eventId: string;

	constructor(private readonly field: HTMLElement) {
		this.datePicker = this.field.querySelector('.date-picker');
		this.dateItems = this.field.querySelector('.date-picker__date-items');
		this.timeItems = this.field.querySelector('.date-picker__time-items');
		this.input = this.field.querySelector('.date-picker__input');
		this.#addEvents();
	}

	init(eventId?: string) {
		this.#clearDate();

		if (eventId) {
			this.eventId = eventId;
			this.getDate();
		} else {
			this.#renderDefault();
		}
	}

	#addEvents() {
		this.input &&
			this.input.addEventListener('click', () => {
				this.datePicker && (this.datePicker.style.display = 'block');
			});
		document.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			if (!target.closest('.date-picker') && !target.classList.contains('date-picker__input')) {
				this.datePicker && (this.datePicker.style.display = 'none');
			}
		});
	}

	getDate() {
		HTTPRequest.get(`/api/events-dates/${this.eventId}/`)
			.then((data) => data.json())
			.then((data) => {
				this.#renderDate(data as TResponse);
			});
	}

	#renderDate({ data }: TResponse) {
		this.data = data;

		if (Array.isArray(data)) {
			this.dateItems!.innerHTML = this.#createHtml(data);
			this.dateItems!.querySelectorAll('.date-picker__item').forEach((item) => {
				item.addEventListener('click', () => {
					this.date = (item as HTMLElement).dataset.key || '';
					this.#setActiveItem(this.dateItems!, item as HTMLElement);
					this.#updateInputDate();
				});
			});
		} else {
			this.dateItems!.innerHTML = this.#createHtml(Object.keys(data) || []);
			this.dateItems!.querySelectorAll('.date-picker__item').forEach((item) => {
				item.addEventListener('click', () => {
					this.date = (item as HTMLElement).dataset.key || '';
					this.time = '';
					this.#showTimes(item as HTMLElement, this.date);
					this.#updateInputDate();
				});
			});
		}
	}

	#showTimes(date: HTMLElement, dateKey: string) {
		this.#setActiveItem(this.dateItems!, date);
		date.classList.add('active');

		this.times = dateKey ? this.data[dateKey] : [];
		this.timeItems && (this.timeItems.innerHTML = this.#createHtml(this.times));

		this.timeItems?.querySelectorAll('.date-picker__item')?.forEach((item) => {
			item.addEventListener('click', () => {
				this.#setActiveItem(this.timeItems!, item as HTMLElement);
				this.time = (item as HTMLElement).dataset.key || '';
				this.#updateInputDate();
			});
		});
	}

	#updateInputDate() {
		if (this.input) {
			let str = `${this.date}`;
			if (this.time) {
				str += `, ${this.time}`;
			}
			this.input.value = str;
			this.input.dispatchEvent(new Event('change'));
		}
	}

	#setActiveItem(parent: HTMLElement, activeItem: HTMLElement) {
		parent.querySelectorAll('.date-picker__item').forEach((item) => {
			item.classList.remove('active');
		});
		activeItem.classList.add('active');
	}

	#createHtml(data: string[]): string {
		let inner = '';
		data.forEach((item) => {
			inner += `<div class="date-picker__item" data-key="${item}">${item}</div>`;
		});
		return inner;
	}

	#clearDate() {
		this.dateItems!.textContent = '';
		this.timeItems && (this.timeItems.textContent = '');
		this.input!.value = '';
	}

	#renderDefault() {
		const date = new Date();
		const dates = [];
		for (let i = 0; i < 31; i++) {
			const day = date.getDate();
			const month = date.getMonth();
			const year = date.getFullYear();
			dates.push(`${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`);
			date.setDate(day + 1);
		}
		this.dateItems!.innerHTML = this.#createHtml(dates);
		this.dateItems!.querySelectorAll('.date-picker__item').forEach((item) => {
			item.addEventListener('click', () => {
				this.date = (item as HTMLElement).dataset.key || '';
				this.#setActiveItem(this.dateItems!, item as HTMLElement);
				this.#updateInputDate();
				this.datePicker && (this.datePicker.style.display = 'none');
			});
		});
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const datePickers: NodeList = document.querySelectorAll('.field__container-date-picker');
	datePickers.length &&
		datePickers.forEach((item) => {
			(item as TDataPicker).instance = new DatePicker(item as HTMLElement);
		});
});
