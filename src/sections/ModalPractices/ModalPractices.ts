import { ValidationError } from 'yup';
import { Validation } from '../../shared/helpers/JS/Validation';

class ModalPractices {
	private readonly form: IForm;
	private readonly formInstance: IForm['formInstance'] | undefined;
	private readonly buttonNextStep: HTMLButtonElement | undefined;
	private stepsCount: NodeListOf<HTMLElement>;
	private formSteps: NodeListOf<HTMLElement>;
	private schemaStep1: Schema = {};
	private schemaStep2: Schema = {};
	private readonly fieldsStep1: NodeListOf<HTMLInputElement>;
	private readonly fieldsStep2: NodeListOf<HTMLInputElement>;
	private buttonFormSubmit: HTMLButtonElement;

	constructor(private readonly element: HTMLElement, private readonly parentClass: string) {
		this.form = this.element.querySelector('.form') as IForm;
		this.formInstance = this.form.formInstance;
		this.buttonNextStep = this.form.querySelector(`.${this.parentClass}__button-next`) as HTMLButtonElement | undefined;

		this.buttonFormSubmit = this.form.querySelector(`.${this.parentClass}__button-submit`) as HTMLButtonElement;
		this.stepsCount = this.element.querySelectorAll(
			`.${this.parentClass}__steps-count .${this.parentClass}__step`
		) as NodeListOf<HTMLElement>;
		this.formSteps = this.element.querySelectorAll(`.${this.parentClass}__form-step`) as NodeListOf<HTMLElement>;
		this.fieldsStep1 = this.formSteps.item(0).querySelectorAll('[data-type]') as NodeListOf<HTMLInputElement>;
		this.fieldsStep2 = this.formSteps.item(1).querySelectorAll('[data-type]') as NodeListOf<HTMLInputElement>;

		this.#init();
	}

	#init() {
		this.schemaStep1 = Validation.createSchemas(this.fieldsStep1);
		this.schemaStep2 = Validation.createSchemas(this.fieldsStep2);
		this.#addEvents();
	}

	#addEvents() {
		this.buttonNextStep && this.buttonNextStep.addEventListener('click', () => this.#nextStep());
		this.buttonFormSubmit.addEventListener('click', (e) =>
			this.formInstance.submit(e, () => {
				this.stepsCount.item(1).classList.remove('active');
				this.stepsCount.item(0).classList.add('active');
				this.formSteps.item(1).classList.remove('active-step');
				this.formSteps.item(0).classList.add('active-step');
			})
		);
	}

	#nextStep() {
		Validation.validationAll(this.fieldsStep1, this.schemaStep1)
			.then(() => this.#switchStep())
			.catch((error) => this.#renderError(error as ValidationError, this.fieldsStep1));
	}

	#switchStep() {
		this.stepsCount.item(0).classList.remove('active');
		this.stepsCount.item(1).classList.add('active');
		this.formSteps.item(0).classList.remove('active-step');
		this.formSteps.item(1).classList.add('active-step');
	}

	#renderError(error: ValidationError, fields: NodeListOf<HTMLElement>) {
		const errors = error.inner.reduce<{ [key: string]: string }>((acc, { path, message }) => {
			return path && !acc[path] ? { ...acc, [path]: message } : acc;
		}, {});

		fields.forEach((field) => this.#markInValid(field, errors[field.dataset.type!]));
	}

	#markInValid(field: HTMLElement, error: string) {
		if (error && field) {
			const fieldContainer = field.closest('.field__container');
			fieldContainer?.classList.add('field__error');
			const errorField = fieldContainer?.querySelector('.field__error-message') as HTMLElement;
			errorField.textContent = this.form?.dataset[error] || '';
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const element = document.querySelector('.modal-practices');
	const parentClass = 'modal-practices';
	element && new ModalPractices(element as HTMLElement, parentClass);
});
