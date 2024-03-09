class ModalProcurement {
	private readonly modal: IModal | null;
	private readonly modalInstance: Modal;
	private readonly form: IForm;
	private readonly formInstance: IForm['formInstance'];
	private buttonsCallerModal: NodeListOf<HTMLButtonElement>;

	constructor(private readonly element: HTMLElement) {
		this.modal = element.querySelector('.modal') as IModal;
		this.form = element.querySelector('.form') as IForm;
		this.modalInstance = this.modal.modalInstance;
		this.formInstance = this.form.formInstance;
		this.buttonsCallerModal = document.querySelectorAll(`[href="#${this.modalInstance.modalName}"]`);

		this.#addEvents();
	}

	#addEvents() {
		this.buttonsCallerModal.forEach((button) => {
			button.addEventListener('click', (e) => this.#createFormHiddenField(e, button));
		});
	}

	#createFormHiddenField(e: Event, button: HTMLButtonElement) {
		e.preventDefault();
		const hiddenInput = this.form.querySelector('[data-type="purchase-number"]') as HTMLInputElement;
		hiddenInput.value = button.dataset.purchaseNumber || '';
		hiddenInput.disabled = true;
		this.modalInstance.show();
		this.form.scrollTop = 0;
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const element = document.querySelector('.modal-procurement') as HTMLElement;
	new ModalProcurement(element);
});
