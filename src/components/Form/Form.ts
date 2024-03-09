import { ValidationError } from 'yup';
import * as schemas from '../../shared/helpers/JS/schemas';
import { HTTPRequest } from '../../shared/helpers/JS/API';
import FileValidation from '../../shared/helpers/JS/FileValidation';
import IMask from 'imask';
import { Validation } from '../../shared/helpers/JS/Validation';

export interface IInput extends HTMLInputElement {
	validator: FileValidation;
	isValid?: boolean;
}

type TFileValidResponse = {
	status: boolean;
	error?: string;
};

interface IResponse {
	status: number;
	date?: string;
	dateFootnote?: string;
	type?: string;
	message?: string;
	errorMessage?: string;
	buttonCaption: string;
	error?: boolean;
}

type CustomSubmitHandler = (url: string, formData: FormData) => void;
class FeedbackFormControl {
	private submitButton: HTMLButtonElement;
	private readonly form: HTMLFormElement;
	private inputs: NodeListOf<HTMLInputElement>;
	private readonly modalDialog: IModal | null;
	private dialogDefaultHeader: HTMLElement | null;
	private dialogDefaultDate: HTMLElement | null;
	private dialogDefaultDateFootnote: HTMLElement | null;
	private dialogDefaultFooter: HTMLElement | null;
	private dialogDefaultFootnote: HTMLElement | null;
	private dialogDefaultButtonCaption: HTMLElement | null;
	private readonly CLASS_FIELD_ERROR: string;
	private readonly mapSchemas: Schema = {};
	private customSubmitHandler: undefined | CustomSubmitHandler;
	private docLang = document.documentElement.lang;

	constructor(block: IForm) {
		this.CLASS_FIELD_ERROR = 'field__error';
		this.form = block;
		this.submitButton = this.form?.querySelector('button[type="submit"]') as HTMLButtonElement;
		this.inputs = this.form?.querySelectorAll('.field__input') as NodeListOf<HTMLInputElement>;
		this.modalDialog = document.querySelector('.hidden-dialog-content .modal');
		this.modalDialog && this.#setDefaultDialogText(this.modalDialog);
		this.form.querySelectorAll('[data-type]').forEach((input) => {
			let name = (input as HTMLInputElement).dataset.type as string;
			if (name === 'phone') {
				input.setAttribute('data-type', this.docLang === 'ru' ? 'phoneRu' : 'phoneAll');
				name = this.docLang === 'ru' ? 'phoneRu' : 'phoneAll';
			}
			if ((schemas as unknown as Schema)[name]) {
				this.mapSchemas[name] = (schemas as unknown as Schema)[name];
			}
		});
		this.#addEvents();
	}

	#setDefaultDialogText(modalDialog: IModal) {
		if (!this.modalDialog) return;

		this.dialogDefaultHeader = modalDialog!.querySelector('.heading')?.cloneNode(true) as HTMLElement;
		this.dialogDefaultFooter = modalDialog!.querySelector('.modal__footer')?.cloneNode(true) as HTMLElement;
		this.dialogDefaultDate = modalDialog!
			.querySelector('.hidden-dialog-content__body-date')
			?.cloneNode(true) as HTMLElement;
		this.dialogDefaultDateFootnote = modalDialog!
			.querySelector('.hidden-dialog-content__body-date-footnote')
			?.cloneNode(true) as HTMLElement;
		this.dialogDefaultFootnote = modalDialog!.querySelector('.heading__footnote')?.cloneNode(true) as HTMLElement;
		this.dialogDefaultButtonCaption = modalDialog!
			.querySelector('.modal__footer .button span')
			?.cloneNode(true) as HTMLElement;
	}

	setCustomSubmitHandler(callback: (url: string, formData: FormData) => void) {
		this.customSubmitHandler = callback;
	}

	#addEvents(): void {
		this.form?.addEventListener('submit', (event: SubmitEvent) => this.submit(event));
		this.form?.querySelectorAll('.input__reset-file').forEach((input) => {
			input.addEventListener('click', (e) => {
				e.preventDefault();
				const inputFile = (e.target as HTMLElement)
					?.closest('.field__container')
					?.querySelector('input') as HTMLInputElement;
				if (inputFile) {
					inputFile.value = '';
					inputFile.removeAttribute('data-file-type');
					inputFile.placeholder = '';
					(inputFile as IInput).validator
						.validation()
						.then((res) => this.#fileValidation(inputFile, res))
						.catch((res) => this.#fileValidation(inputFile, res));
				}
			});
		});
		this.inputs.forEach((input) => {
			if (input.type === 'file') {
				(input as IInput).validator = new FileValidation(input);
			}
			this.#setValidateInputListeners(input);
		});
	}

	#fileValidation(field: HTMLInputElement, result: TFileValidResponse) {
		const fieldContainer = field.closest('.field__container');
		if (result?.status) {
			(field as IInput).isValid = true;
			fieldContainer?.classList.remove(this.CLASS_FIELD_ERROR);
		} else {
			(field as IInput).isValid = false;
			fieldContainer?.classList.add(this.CLASS_FIELD_ERROR);
		}
		const errorMessage = fieldContainer?.querySelector('.field__error-message') as HTMLElement;
		const errorText = result.error && this.form?.dataset[result.error];
		errorMessage && (errorMessage.textContent = errorText ? errorText : '');
	}

	#markValid(input: HTMLElement) {
		const fieldContainer = input.closest('.field__container');
		fieldContainer?.classList.remove(this.CLASS_FIELD_ERROR);
		const errorMessage = fieldContainer?.querySelector('.field__error-message') as HTMLElement;
		errorMessage.textContent = '';
	}

	#markInValid(input: HTMLElement, error: string) {
		if (!input || !error) return;
		const fieldContainer = input.closest('.field__container');
		fieldContainer?.classList.add(this.CLASS_FIELD_ERROR);
		const errorMessage = fieldContainer?.querySelector('.field__error-message') as HTMLElement;
		errorMessage.textContent = this.form?.dataset[error] || '';
	}

	#validate(submitCallback?: () => void) {
		let resultFileValidation = true;
		const inputsFile = this.form?.querySelectorAll('[type=file]') as NodeListOf<IInput>;

		inputsFile.forEach((input) => {
			(input as IInput).validator
				.validation()
				.then((res) => {
					this.#fileValidation(input, res);
				})
				.catch((res) => {
					resultFileValidation = false;
					this.#fileValidation(input, res);
				});
		});

		Validation.validationAll(this.inputs, this.mapSchemas)
			.then(() => {
				if (inputsFile.length && !resultFileValidation) return;
				this.#request(submitCallback);
			})
			.catch((error: ValidationError) => {
				const errors = error.inner.reduce<{ [key: string]: string }>(
					(acc, { path, message }) => (path && !acc[path] ? { ...acc, [path]: message } : acc),
					{}
				);
				this.inputs.forEach((field) => {
					const errorMessage = errors[field.dataset.type!];
					errorMessage && this.#markInValid(field, errorMessage);
				});
			});
	}

	#setValidateInputListeners(input: HTMLInputElement) {
		const masksOptions = {
			phone: {
				mask: '+{7}(000)-000-0000',
				placeholderChar: '_',
			},
		};
		const masksOptionsUnknown = {
			phone: {
				mask: '0000000000000',
				startsWith: '',
				country: 'unknown',
			},
		};
		if (input.dataset.type === 'phoneRu' || input.dataset.type === 'phoneAll' || input.dataset.type === 'phone') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const patternMaskPhoneInput = new IMask(
				input,
				this.docLang === 'ru' ? masksOptions.phone : masksOptionsUnknown.phone
			);
			input.addEventListener(
				'focus',
				function () {
					patternMaskPhoneInput.updateOptions?.({ lazy: false });
				},
				true
			);
			input.addEventListener(
				'blur',
				function () {
					patternMaskPhoneInput.updateOptions?.({ lazy: true });
				},
				true
			);

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			input.mask = patternMaskPhoneInput;
		}

		input.addEventListener('input', async (event: Event) => {
			const target: HTMLInputElement = event.target as HTMLInputElement;
			Validation.validationField(target)
				.then(() => {
					this.#markValid(target);
				})
				.catch((err: ValidationError) => err);
		});

		input.addEventListener('change', async (event: Event) => {
			const target: HTMLInputElement = event.target as HTMLInputElement;

			if (input?.dataset.type === 'file') {
				(input as IInput).validator
					.validation()
					.then((res) => this.#fileValidation(input, res))
					.catch((res: TFileValidResponse) => this.#fileValidation(input, res));

				this.#setTypeFile(input);
			} else {
				Validation.validationField(target)
					.then(() => this.#markValid(target))
					.catch((error: ValidationError) => this.#markInValid(target, error.message));
			}
		});
	}

	#renderText(response: IResponse) {
		response.error && this.modalDialog?.classList.add('error');
		const dialogHeader = (this.modalDialog as IModal).querySelector('.heading') as HTMLElement;
		const dialogFooter = (this.modalDialog as IModal).querySelector('.modal__footer') as HTMLElement;
		const dialogDate = (this.modalDialog as IModal).querySelector('.hidden-dialog-content__body-date') as HTMLElement;
		const dialogDateFootnote = (this.modalDialog as IModal).querySelector(
			'.hidden-dialog-content__body-date-footnote'
		) as HTMLElement;
		const headerFootnote = dialogHeader?.querySelector('.heading__footnote') as HTMLElement;
		const closeButton = dialogFooter?.querySelector('.button span') as HTMLElement;
		if (response.message) {
			dialogHeader.innerHTML = response.message || response.errorMessage || '';
		} else {
			this.dialogDefaultHeader && dialogHeader.replaceWith(this.dialogDefaultHeader!.cloneNode(true));
		}

		if (response.dateFootnote !== undefined) {
			dialogDateFootnote.innerHTML = response.dateFootnote || response.errorMessage || '';
		} else {
			this.dialogDefaultDateFootnote && dialogDateFootnote.replaceWith(this.dialogDefaultDateFootnote!.cloneNode(true));
		}

		if (response.date !== undefined) {
			dialogDate.innerHTML = response.date || response.errorMessage || '';
		} else {
			this.dialogDefaultDate && dialogDate.replaceWith(this.dialogDefaultDate!.cloneNode(true));
		}

		if (response.type !== undefined) {
			headerFootnote.textContent = response.type;
		} else {
			this.dialogDefaultFootnote && headerFootnote.replaceWith(this.dialogDefaultFootnote.cloneNode(true));
		}

		if (response.buttonCaption !== undefined) {
			if (response.buttonCaption === '') {
				(dialogFooter?.querySelector('.button') as HTMLElement).style.display = 'none';
			} else {
				closeButton.textContent = response.buttonCaption;
				(dialogFooter?.querySelector('.button') as HTMLElement).style.display = 'inline-block';
			}
		} else {
			this.dialogDefaultButtonCaption && closeButton.replaceWith(this.dialogDefaultButtonCaption.cloneNode(true));
		}
		dialogHeader.prepend(headerFootnote);

		this.modalDialog?.modalInstance.show();
	}

	submit(event: SubmitEvent, submitCallback?: () => void) {
		event.preventDefault();

		this.#validate(submitCallback);
	}

	#defaultRequest(url: string, formData: FormData, submitCallback?: () => void) {
		if (this.form['purchase-number']) {
			formData.set('purchase-number', this.form['purchase-number'].value);
		}
		HTTPRequest.post(url, formData)
			.then((data) => {
				return data.json();
			})
			.then((response) => {
				if (!this.modalDialog) return;
				this.inputs.forEach((input) => {
					input.value = input.dataset?.defaultValue ?? '';
					input.removeAttribute('data-selected');
					input.removeAttribute('data-selected-id');
					const selected = input.closest('.field__container')?.querySelector('.custom-select__selected');
					selected && (selected.textContent = '');
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					const masked = input.mask?.masked;
					masked && masked.reset();
				});
				this.submitButton.disabled = false;
				this.#renderText(response);
				if (submitCallback) {
					submitCallback();
				}
			})
			.catch(() => {
				this.submitButton.disabled = false;
				if (this.modalDialog) {
					this.dialogDefaultHeader &&
						this.modalDialog!.querySelector('.heading')!.replaceWith(this.dialogDefaultHeader!.cloneNode(true));
					this.dialogDefaultFooter &&
						this.modalDialog!.querySelector('.modal__footer')!.replaceWith(this.dialogDefaultFooter!.cloneNode(true));
				}
				this.modalDialog?.modalInstance.show();
			});
	}

	#request(submitCallback?: () => void) {
		this.submitButton.disabled = true;
		this.submitButton.ariaAutoComplete = 'off';
		const actionRequestUrl = this.form.action;
		const formData = new FormData(this.form);
		if (this.customSubmitHandler) {
			this.customSubmitHandler(actionRequestUrl, formData);
			this.submitButton.disabled = false;
		} else {
			this.#defaultRequest(actionRequestUrl, formData, submitCallback);
		}
	}

	#setTypeFile(field: HTMLInputElement) {
		let typeFile: string = '';
		const { files } = field;
		if (files && files.length) {
			typeFile = files[0].name.split('.')[1];
			field.setAttribute('data-file-type', typeFile);
		} else {
			field.removeAttribute('data-file-type');
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const selectorElems = '.form';
	const elems = document.querySelectorAll(selectorElems) as NodeListOf<IForm>;
	elems.forEach((elem) => {
		elem.formInstance = new FeedbackFormControl(elem);
	});
});
