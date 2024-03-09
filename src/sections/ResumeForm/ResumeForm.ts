import FileValidation from '../../shared/helpers/JS/FileValidation';
import { IInput } from '../../components/Form/Form';

class ResumeForm {
	private stepCounter: HTMLElement | null;
	private readonly hiddenInputFile: IInput | null;
	private firstStep: HTMLElement | null;
	private readonly errorButton: HTMLElement | null;
	private readonly secondStep: HTMLElement | null;
	private readonly secondStepForm: HTMLInputElement;
	private formInstance: unknown;

	constructor(private readonly section: HTMLElement, private readonly parentClass: string) {
		this.stepCounter = this.section.querySelector(`.${this.parentClass}__step-counter`);
		this.hiddenInputFile = this.section.querySelector(`.${this.parentClass}__hidden-input`);
		this.firstStep = this.section.querySelector(`.${this.parentClass}__file-loader`);
		this.secondStep = this.section.querySelector(`.${this.parentClass}__form`);
		this.errorButton = this.section.querySelector(`.${this.parentClass}__error-button`);
		this.secondStepForm = this.secondStep?.querySelector('.field__input[data-type="file"]') as HTMLInputElement;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this.formInstance = this.secondStep?.querySelector('form').formInstance;
	}

	init() {
		this.#addEvents();
		if (this.hiddenInputFile) {
			this.hiddenInputFile.validator = new FileValidation(this.hiddenInputFile);
		}
	}

	#addEvents() {
		if (this.hiddenInputFile) {
			this.hiddenInputFile.addEventListener('change', (e) => {
				(e.target as IInput).validator
					.validation()
					.then((res) => this.#fileValidation(e.target as IInput, res))
					.catch((res) => this.#fileValidation(e.target as IInput, res));
			});
		}
		this.errorButton && this.errorButton.addEventListener('click', () => this.#resetForm());
		this.secondStep &&
			this.secondStep.querySelector('.form__button')?.addEventListener('click', (e) => this.#submitForm(e));
	}

	#fileValidation(field: HTMLInputElement, result: { error?: string; status: boolean }) {
		if (result.status) {
			this.#renderSuccess(field);
		} else {
			this.#renderError();
		}
	}

	#renderSuccess(field: HTMLInputElement) {
		this.firstStep?.classList.add('success');
		this.firstStep?.classList.remove('error');
		const successText = this.firstStep?.querySelector(`.${this.parentClass}__success-text .text`);
		if (successText && field.files) {
			successText.textContent = field.files[0].name;
			this.#transferFile(field.files);
			setTimeout(() => this.#showForm(), 1000);
		}
	}

	#renderError() {
		this.firstStep?.classList.remove('success');
		this.firstStep?.classList.add('error');
	}

	#resetForm() {
		this.hiddenInputFile && (this.hiddenInputFile.value = '');
		this.firstStep?.classList.remove('success');
		this.firstStep?.classList.remove('error');
		this.firstStep?.classList.remove('d-none');
		this.secondStep?.classList.add('d-none');
		const steps = this.stepCounter?.querySelectorAll(`.${this.parentClass}__step`);
		steps?.item(1).classList.remove('active');
		steps?.item(0).classList.add('active');
	}

	#showForm() {
		const steps = this.stepCounter?.querySelectorAll(`.${this.parentClass}__step`);
		steps?.item(0).classList.remove('active');
		steps?.item(1).classList.add('active');
		this.firstStep?.classList.add('d-none');
		this.secondStep?.classList.remove('d-none');
	}

	#transferFile(files: FileList) {
		this.secondStepForm.files = files;
		this.secondStepForm.dispatchEvent(new Event('change'));
	}

	#submitForm(e: Event) {
		e.stopImmediatePropagation();
		e.preventDefault();

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this.formInstance.submit(e, () => {
			this.#resetForm();
		});
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const resumeForm = document.querySelector('.resume-form') as HTMLElement;

	new ResumeForm(resumeForm, 'resume-form').init();
});
