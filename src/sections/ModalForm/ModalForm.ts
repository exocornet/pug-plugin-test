class ModalForm {
	private modal: HTMLElement;
	private dataPicker: TDataPicker;
	private modalInstance: Modal;
	private eventId: string;
	private form: HTMLFormElement;

	constructor() {
		this.modal = document.querySelector('.modal-form') as HTMLElement;
		this.modalInstance = (this.modal.querySelector('.modal') as IModal)?.modalInstance;
		this.dataPicker = this.modal.querySelector('.field__container-date-picker') as TDataPicker;
		this.form = this.modal.querySelector('.form') as HTMLFormElement;
		this.#addEvents();
	}

	#addEvents() {
		document.querySelectorAll('a[href="#modal-form"]')?.forEach((item) => {
			item.addEventListener('click', (e) => this.#init(e, item as HTMLElement));
		});
	}

	#createHiddenInput() {
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'event-id';
		input.classList.add('input__event-id');
		return input;
	}

	#init(e: Event, item: HTMLElement) {
		e.preventDefault();
		let inputHidden: HTMLInputElement | null = this.form.querySelector('.input__event-id');

		if (!inputHidden) {
			inputHidden = this.#createHiddenInput();
			this.form.append(inputHidden);
		}

		this.eventId = item.dataset.eventId || '';
		if (this.eventId) {
			inputHidden.value = this.eventId;
			this.dataPicker.instance.init(this.eventId);
			this.modalInstance.show();
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	new ModalForm();
});
