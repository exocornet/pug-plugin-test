class ModalOrderForm {
	private readonly modal: IModal | null;
	private readonly form: HTMLElement | null;
	private readonly datasetFromModal: DOMStringMap | null;

	constructor(private readonly section: HTMLElement) {
		this.modal = this.section.querySelector('.modal');
		this.form = this.section.querySelector('.form');
		this.datasetFromModal = this.#getDatasetFromModal();
		this.#addEvents();
	}

	#addEvents() {
		document.querySelectorAll(`[href="#${this.datasetFromModal?.name}"]`)?.forEach((item) => {
			item?.addEventListener('click', (event) => {
				event.preventDefault();
				const modalHeadingText = (item as HTMLElement).dataset.order || '';
				this.#renderModal(modalHeadingText);
				this.#addFormField(modalHeadingText);
			});
		});
	}

	#getDatasetFromModal(): DOMStringMap | null {
		return this.modal?.dataset || null;
	}

	#renderModal(text?: string) {
		const modalHeading = this.modal?.querySelector('.heading');
		if (text && modalHeading) {
			modalHeading.textContent = text;
		}
		this.modal?.modalInstance.show();
	}

	#addFormField(text?: string) {
		if (text) {
			const hiddenInput = document.createElement('input');
			hiddenInput.hidden = true;
			hiddenInput.name = 'order';
			hiddenInput.value = text;
			this.form?.append(hiddenInput);
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const modalOrderForm = document.querySelector('.modal-order-form') as HTMLElement;
	new ModalOrderForm(modalOrderForm);
});
