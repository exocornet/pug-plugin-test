import DropList from '../../shared/ui/DropList/DropList';
import * as yup from 'yup';

type TResponseError = {
	name: string;
	errors: string;
};

class FormSearchWork {
	private dropList: DropList;
	private form: HTMLFormElement;
	private readonly inputSearch: HTMLInputElement;
	private readonly dropListItem: HTMLElement;

	constructor(private readonly section: HTMLElement, private readonly sectionClass: string) {
		this.form = this.section.querySelector(`.${sectionClass}__form`) as HTMLFormElement;
		this.inputSearch = this.form?.querySelector('[data-type="search"]') as HTMLInputElement;
		this.dropListItem = this.form?.querySelector('.drop-list') as HTMLElement;
		this.dropList = new DropList(this.dropListItem);
		this.#addEvents();
	}

	#addEvents() {
		this.form.addEventListener('submit', (e) => this.#submit(e));
		this.inputSearch.addEventListener('input', () => this.#validation());
	}

	#createValidationSchema({ required, min }: DOMStringMap) {
		let schema = yup.string();
		required !== undefined && (schema = schema.required('required'));
		min && (schema = schema.min(parseInt(min), 'min'));
		return schema;
	}

	#submit(event: SubmitEvent) {
		event.preventDefault();
		this.#validation();
		if (this.form?.dataset?.valid === 'false') return;
		this.form?.submit();
	}

	#validation() {
		try {
			this.#createValidationSchema(this.inputSearch.dataset).validateSync(this.inputSearch.value);
			this.#success();
		} catch (err) {
			this.#renderError(err as TResponseError);
		}
	}

	#success() {
		this.form?.removeAttribute('data-valid');
		const fieldContainer = this.inputSearch.closest('.field__container');
		fieldContainer?.classList.remove('field__error');
		const errorMessage = fieldContainer?.querySelector('.field__error-message') as HTMLElement;
		errorMessage.textContent = '';
	}

	#renderError({ errors }: TResponseError) {
		if (!this.inputSearch) return;
		this.form?.setAttribute('data-valid', 'false');
		const fieldContainer = this.inputSearch.closest('.field__container');
		fieldContainer?.classList.add('field__error');
		const errorMessage = fieldContainer?.querySelector('.field__error-message') as HTMLElement;
		errorMessage.textContent = this.form.dataset[errors[0]] || '';
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const sectionClass = 'form-search-work';
	const section = document.querySelector(`.${sectionClass}`);
	section && new FormSearchWork(section as HTMLElement, sectionClass);
});
