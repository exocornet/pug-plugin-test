import { Validation } from '../../shared/helpers/JS/Validation';
import { ValidationError } from 'yup';
import { HTTPRequest } from '../../shared/helpers/JS/API';
import { ISelect } from '../../shared';

type TSearchResponse = {
	status: string;
	msg?: string;
};

interface LanguageShorthand {
	ru: string;
	en: string;
	zh: string;
}

const headnoteTranslationOptions: LanguageShorthand = {
	ru: 'получить «паспорт качества»',
	en: 'get a «quality passport»',
	zh: '获得 «质量护照»',
};

const headingTextContentSuccess: LanguageShorthand = {
	ru: '«паспорт качества» загружен на ваше устройство',
	en: '«quality passport» has been downloaded to your device',
	zh: '«质量证书»下载到您的设备',
};

const headingTextContentFailure: LanguageShorthand = {
	ru: 'паспорт не найден',
	en: 'passport not found',
	zh: '未找到护照',
};

enum Action {
	INCREMENT = 'increment',
	DECREMENT = 'decrement',
}

class ModalQualityPassport {
	private form: IForm;
	private readonly select: HTMLSelectElement;
	private transportNumber: HTMLInputElement;
	private transportNumberLabel: HTMLElement;
	private texts: { [k: string]: string };
	private buttonSubmit: HTMLButtonElement;
	private readonly fields: NodeListOf<HTMLInputElement>;
	private schema: Schema;
	private modal: IModal;
	private steps: NodeListOf<HTMLElement>;
	private stepCount: number = 0;
	private fileWrapper: HTMLElement;
	private loader: HTMLElement;
	private modalDialog: IModal;
	private selectInstance: ISelect['selectInstance'];
	private docLang: string = document.documentElement.lang;

	constructor(private readonly section: HTMLElement) {
		this.modal = this.section.querySelector('.modal') as IModal;
		this.modalDialog = document.querySelector('.hidden-dialog-content .modal') as IModal;
		this.steps = this.modal.querySelectorAll('.step') as NodeListOf<HTMLElement>;
		this.form = this.section.querySelector('.form') as IForm;
		this.select = this.form.querySelector('[data-type=transport]') as HTMLSelectElement;
		this.selectInstance = (this.select.closest('.custom-select') as ISelect).selectInstance;
		this.fields = this.form.querySelectorAll('[data-type]') as NodeListOf<HTMLInputElement>;
		this.transportNumber = this.form.querySelector('[data-type=number]') as HTMLInputElement;
		this.buttonSubmit = this.form.querySelector('.form__button') as HTMLButtonElement;
		this.fileWrapper = this.section.querySelector('.modal-quality-passport__file-wrapper') as HTMLElement;
		this.loader = this.section.querySelector('.modal-quality-passport__loader') as HTMLElement;
		this.transportNumberLabel = this.transportNumber
			.closest('.field__container')!
			.querySelector('.field__floating-label') as HTMLElement;
		this.transportNumberLabel.textContent = this.form.dataset?.defaultTransportLabel || '№ транспорта';
		this.#init();
	}

	#init() {
		this.schema = Validation.createSchemas(this.fields);
		this.#addEvents();
		this.#createObserver();
	}

	#addEvents() {
		this.buttonSubmit.addEventListener('click', (e) => this.#submitForm(e));
		this.fileWrapper.addEventListener('click', () => this.#loadFile());
		this.modal.querySelector('.modal__close')?.addEventListener('click', () => {
			this.form.querySelectorAll('[data-type]').forEach((input) => {
				(input as HTMLInputElement).value = '';
			});
			this.selectInstance.addSelectedIndex(0);
			this.selectInstance.addSameSelectedClass(0);
			this.transportNumberLabel.textContent = this.form.dataset?.defaultTransportLabel || '№ транспорта';
		});
	}

	#createObserver() {
		this.texts = {
			'0': this.form.dataset?.containerLabel || '№ контейнера',
			'1': this.form.dataset?.carLabel || '№ автомобиля',
			'2': this.form.dataset?.carriageLabel || '№ вагона',
			'3': this.form.dataset?.containerLabel || '№ контейнера',
		};
		const observer = new MutationObserver(() => this.#observerCallback());
		observer.observe(this.select, { attributes: true, attributeFilter: ['data-selected'] });
	}

	#observerCallback() {
		this.transportNumber.value = '';
		const id = this.select.dataset?.selectedId || 0;
		this.transportNumberLabel.textContent = this.texts[id];
	}

	#submitForm(e: Event) {
		e.preventDefault();
		Validation.validationAll(this.fields, this.schema)
			.then(() => this.#request())
			.catch((error) => this.#renderError(error as ValidationError, this.fields));
	}

	#renderError(error: ValidationError, fields: NodeListOf<HTMLInputElement>) {
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

	#request() {
		HTTPRequest.get(
			`https://qp.azot.kuzbass.net/passportCheck.php?nomer_ts=${this.form.number.value}&nomer_nakl=${this.form.invoice.value}`
		)
			.then((data) => data.json())
			.then((data: TSearchResponse) => {
				if (data.status === 'ok') {
					this.#changeStep(Action.INCREMENT);
				} else if (data.status === 'error') {
					this.#showModalDialog(data.msg);
				}
			})
			.catch((err) => err);
	}

	#changeStep(action: string) {
		this.steps.forEach((step) => step.classList.remove('active'));
		this.stepCount = action === Action.INCREMENT ? 1 : 0;
		this.steps.item(this.stepCount).classList.add('active');
	}

	#showModalDialog(msg?: string) {
		const heading = this.modalDialog.querySelector('.heading') as HTMLElement;
		const span = heading.querySelector('.heading span') as HTMLSpanElement;

		span.textContent = headnoteTranslationOptions[this.docLang as keyof LanguageShorthand];
		heading.textContent =
			msg && msg.toLowerCase() === 'паспорт не найден.'
				? headingTextContentFailure[this.docLang as keyof LanguageShorthand]
				: headingTextContentSuccess[this.docLang as keyof LanguageShorthand];
		heading.prepend(span);
		this.modalDialog.modalInstance.show();
	}

	#showLoader() {
		this.loader.classList.add('show');
	}

	#hideLoader() {
		this.loader.classList.remove('show');
	}

	#closeFormModal() {
		this.#changeStep(Action.DECREMENT);
		this.form.querySelectorAll('[data-type]').forEach((input) => {
			(input as HTMLInputElement).value = '';
		});
		this.selectInstance.addSelectedIndex(0);
		this.selectInstance.addSameSelectedClass(0);
		this.#hideLoader();
		this.#showModalDialog();
	}

	#loadFile() {
		this.#showLoader();
		HTTPRequest.get(
			`https://qp.azot.kuzbass.net/passportGet.php?nomer_ts=${this.form.number.value}&nomer_nakl=${this.form.invoice.value}`
		)
			.then((data) => data.blob())
			.then((response) => {
				const url = URL.createObjectURL(response);
				//window.open(url, '_blank');
				const link = document.createElement('a');
				link.setAttribute('href', url);
				link.setAttribute('download', url);
				link.click();

				this.#closeFormModal();
			})
			.finally(() => this.#hideLoader());
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const section = document.querySelector('.modal-quality-passport');

	section && new ModalQualityPassport(section as HTMLElement);
});
