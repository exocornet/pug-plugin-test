class Modal {
	modalName: string;
	private readonly swipeModal: HTMLElement | null;
	overlay: HTMLElement | null;
	dataset: DOMStringMap | undefined;
	beforeShow: () => void | undefined;

	constructor(private readonly modal: HTMLElement) {
		this.modalName = this.modal.dataset.name || '';
		this.swipeModal = this.modal.querySelector('.modal__swipe-modal') || null;
		this.overlay = this.modal.querySelector('.modal__overlay');
		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
	}

	#addEvents() {
		this.overlay &&
			this.overlay.addEventListener(
				'click',
				() => {
					this.hide();
				},
				{ once: true }
			);
		this.modal.querySelector('.modal__close')?.addEventListener('click', this.hide, { once: true });
		this.modal.querySelector('.modal__footer-button-close')?.addEventListener('click', this.hide, { once: true });
		this.swipeModal && this.swipeModal.addEventListener('click', this.hide, { once: true });
	}

	show(caller?: HTMLElement) {
		if (this.beforeShow) this.beforeShow();
		this.dataset = caller?.dataset;
		document.documentElement.style.overflow = 'hidden';
		document.querySelectorAll('.modal').forEach((modal) => modal.classList.remove('show'));
		this.modal.classList.add('show');
		this.#addEvents();
	}

	hide() {
		document.documentElement.style.overflow = '';
		this.modal.classList.remove('show');
		this.modal.classList.remove('error');
		this.#clearForm();
	}

	#clearForm() {
		const form = this.modal.querySelector('.form');
		if (form) {
			form.querySelectorAll('.field__container').forEach((field) => {
				const input = field.querySelector('[name]') as HTMLInputElement | HTMLSelectElement;
				field.classList.remove('field__error');
				input.removeAttribute('data-selected');
				input.removeAttribute('data-selected-id');
				input.removeAttribute('data-file-type');

				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const masked = input.mask?.masked;
				masked && masked.reset();
				input.value = input.dataset?.defaultValue ?? '';
			});
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const modals: NodeListOf<IModal> = document.querySelectorAll('.modal');

	modals.forEach((modal) => {
		modal.modalInstance = new Modal(modal);
		document.querySelectorAll(`a[href="#${modal.dataset.name}"]`)?.forEach((item) => {
			const dataset = (item as HTMLElement).dataset;
			if (dataset?.modalInit === 'false') return;

			item?.addEventListener('click', (event) => {
				event.preventDefault();
				event.stopPropagation();
				modal.modalInstance.show(item as HTMLElement);
			});
		});
	});
});
