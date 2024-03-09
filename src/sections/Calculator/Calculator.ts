import { HTTPRequest } from '../../shared/helpers/JS/API';
import { ISelect, SelectControl, SliderControl, SliderWithControl } from '../../shared';

interface IFirstStepValues {
	[k: string]: FormDataEntryValue;
}

interface IToggleFootnote {
	add: () => void;
	remove: () => void;
}

interface IResponse {
	status: number;
	type?: string;
	message?: string;
	errorMessage?: string;
	buttonCaption: string;
	error?: boolean;
}

type TResponseTypes = {
	status: number;
	data: { [k: string]: string };
};

type TResponseModels = {
	status: number;
	data: {
		[k: string]: {
			title: string;
			price: {
				city: string;
				region: string;
				[key: string]: string;
			};
		};
	};
};

class CalculatorControl {
	private readonly block: HTMLElement;
	private currency: number | string;
	private readonly numberOfCars: HTMLInputElement | undefined | null;
	private readonly numberOfHours: HTMLInputElement | undefined | null;
	private readonly calculationValueElement: HTMLElement | undefined | null;
	private readonly calculatorContainer: HTMLElement | null;
	private readonly stepsMarkup: NodeListOf<HTMLElement> | undefined;
	private readonly typeSelect: SelectControl;
	private readonly modelSelect: SelectControl;
	private regionSelect: SelectControl;
	private sliderInstance: SliderControl | undefined;
	private readonly formFirstStep: IForm;
	private readonly formSecondStep: IForm;
	private firstStepValue: IFirstStepValues;
	private datePicker: TDataPicker;
	private datePickerInstance: TDataPicker['instance'];
	private models: TResponseModels['data'];
	private modalDialog: IModal;
	private readonly dialogDefaultButtonCaption: HTMLElement;
	private readonly dialogDefaultFootnote: HTMLElement;
	private readonly dialogDefaultHeader: HTMLElement;

	constructor(private readonly section: HTMLElement) {
		this.block = section;
		this.modalDialog = document.querySelector('.hidden-dialog-content .modal') as IModal;
		this.dialogDefaultButtonCaption = this.modalDialog
			.querySelector('.modal__footer .button span')
			?.cloneNode(true) as HTMLElement;
		this.dialogDefaultFootnote = this.modalDialog!.querySelector('.heading__footnote')?.cloneNode(true) as HTMLElement;
		this.dialogDefaultHeader = this.modalDialog!.querySelector('.heading')?.cloneNode(true) as HTMLElement;
		//form of steps
		this.formFirstStep = this.block?.querySelector('.form[data-name="transportFirstStep"]') as IForm;
		this.formSecondStep = this.block?.querySelector('.form[data-name="transportSecondStep"]') as IForm;

		//fields of form first step for calculate
		this.numberOfCars = this.formFirstStep?.querySelector('.input-number[name="numberOfCars"]') as HTMLInputElement;
		this.numberOfHours = this.formFirstStep?.querySelector('.input-number[name="numberOfHours"]') as HTMLInputElement;

		this.modelSelect = (
			this.formFirstStep?.querySelector('select[name="transportModel"]')?.closest('.custom-select') as ISelect
		).selectInstance;
		this.typeSelect = (
			this.formFirstStep?.querySelector('select[name="transportType"]')?.closest('.custom-select') as ISelect
		).selectInstance;
		this.regionSelect = (
			this.formFirstStep?.querySelector('select[name="transportRegion"]')?.closest('.custom-select') as ISelect
		).selectInstance;

		this.datePicker = this.block?.querySelector('.field__container-date-picker') as TDataPicker;
		this.datePickerInstance = this.datePicker.instance!;

		this.calculatorContainer = this.block?.querySelector('.calculator__container');
		this.calculationValueElement = this.formFirstStep?.querySelector('.form__estimated-value') as HTMLElement;
		this.stepsMarkup = this.calculatorContainer?.querySelectorAll('.calculator__footnote-step');
		this.sliderInstance = (this.calculatorContainer?.querySelector('.slider') as SliderWithControl).sliderControl;
		this.#getData('/api/transport/types/', (data) => this.#renderTypes(data as unknown as TResponseTypes));
		this.#addEvents();
		this.setActiveStep();
		this.datePickerInstance.init();
	}

	#getData(url: string, callback?: (data: { [k: string]: string }) => void) {
		HTTPRequest.get(url)
			.then((data) => {
				return data.json();
			})
			.then((data) => callback && callback(data))
			.catch((data) => data);
	}

	#renderTypes({ data }: TResponseTypes) {
		const types = [];
		for (const key in data) {
			types.push({
				key,
				text: data[key],
			});
		}
		if (this.typeSelect && this.typeSelect.selectElement) {
			this.typeSelect.createNewOptions(types);
		}

		if (this.numberOfCars && this.numberOfHours) {
			this.typeSelect.selectElement.value = types[0].key;
			this.numberOfCars.value = '1';
			this.numberOfHours.value = '1';
		}

		this.typeSelect.addSelectedIndex(1);
		this.typeSelect.changeClassFloatingLabel('add');
		this.typeSelect.addSameSelectedClass(1);

		this.#getData(`/api/transport/types/${this.typeSelect.selectElement.value}/models/`, (data) =>
			this.#renderModels(data as unknown as TResponseModels)
		);

		this.regionSelect.selectElement.value = (this.regionSelect.selectElement.children[1] as HTMLOptionElement).value;
		this.regionSelect.addSelectedIndex(1);
		this.regionSelect.changeClassFloatingLabel('add');
		this.regionSelect.addSameSelectedClass(1);
	}

	#renderModels({ data }: TResponseModels) {
		this.models = data;
		const types = [];
		for (const key in data) {
			types.push({
				key,
				text: data[key].title,
			});
		}
		if (types && types.length && this.modelSelect && this.modelSelect.selectElement) {
			this.modelSelect.createNewOptions(types);
			this.modelSelect.selectElement.value = types[0].key;
			this.modelSelect.addSelectedIndex(1);
			this.modelSelect.changeClassFloatingLabel('add');
			this.modelSelect.addSameSelectedClass(1);
			this.calculateEstimatedPrice();
		}
	}

	#addEvents() {
		this.formFirstStep?.formInstance.setCustomSubmitHandler(this.#submitFirstStep.bind(this));
		this.formSecondStep?.formInstance.setCustomSubmitHandler(this.#submitSecondStep.bind(this));
		this.typeSelect.selectElement?.addEventListener('change', this.changeTypeHandler.bind(this));
		this.modelSelect.selectElement?.addEventListener('change', this.calculateEstimatedPrice.bind(this));
		this.regionSelect.selectElement?.addEventListener('change', this.calculateEstimatedPrice.bind(this));
		this.numberOfCars && this.numberOfCars.addEventListener('change', this.calculateEstimatedPrice.bind(this));
		this.numberOfHours && this.numberOfHours.addEventListener('change', this.calculateEstimatedPrice.bind(this));
	}

	changeTypeHandler(event: Event) {
		const target: HTMLInputElement = event.target as HTMLInputElement;
		this.fetchOptions(target.value);
	}

	calculateEstimatedPrice() {
		if (
			this.modelSelect.selectElement &&
			this.regionSelect.selectElement &&
			this.numberOfCars &&
			this.numberOfHours &&
			this.models &&
			this.calculationValueElement
		) {
			const modelValue = this.modelSelect.selectElement.value;
			const regionValue: string = this.regionSelect.selectElement.value || '';
			const modelBySelect = this.models[modelValue];

			if (modelBySelect) {
				const price = modelBySelect.price;
				this.currency = price[regionValue];
				const result =
					parseInt(this.numberOfCars?.value) * parseInt(this.numberOfHours?.value) * parseInt(this.currency);
				this.calculationValueElement.textContent = result ? result.toString() : '';
			}
		}
	}

	setActiveStep() {
		if (this.stepsMarkup?.length) {
			const sliderIndex = this.sliderInstance?.swiperSlider.activeIndex;
			this.toggleFootnoteContainer('remove');
			if (sliderIndex === 0) {
				this.stepsMarkup[sliderIndex + 1].classList.add('calculator__footnote-step-active');
				this.stepsMarkup[0].classList.remove('calculator__footnote-step-active');
			}
			if (sliderIndex === 1) {
				this.stepsMarkup[sliderIndex - 1].classList.add('calculator__footnote-step-active');
				this.stepsMarkup[1].classList.remove('calculator__footnote-step-active');
			}
			if (sliderIndex && sliderIndex > 1) {
				this.toggleFootnoteContainer('add');
			}
		}
	}

	toggleFootnoteContainer(name: keyof IToggleFootnote) {
		if (this.stepsMarkup?.length) {
			const footnoteContainer = this.stepsMarkup[0]?.closest('.calculator__footnote-container');
			const mapToggle: IToggleFootnote = {
				add: () => footnoteContainer?.classList.add('d-none'),
				remove: () => footnoteContainer?.classList.remove('d-none'),
			};
			mapToggle[name]();
		}
	}

	#renderResultMessageText(response: IResponse) {
		response.error && this.modalDialog?.classList.add('error');
		const dialogHeader = (this.modalDialog as IModal).querySelector('.heading') as HTMLElement;
		const dialogFooter = (this.modalDialog as IModal).querySelector('.modal__footer') as HTMLElement;
		const headerFootnote = dialogHeader?.querySelector('.heading__footnote') as HTMLElement;
		const closeButton = dialogFooter?.querySelector('.button span') as HTMLElement;
		if (response.message) {
			dialogHeader.innerHTML = response.message || response.errorMessage || '';
		} else {
			this.dialogDefaultHeader && dialogHeader.replaceWith(this.dialogDefaultHeader!.cloneNode(true));
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

	fetchOptions(type: string) {
		HTTPRequest.get(`/api/transport/types/${type}/models/`)
			.then((data) => {
				return data.json();
			})
			.then((response: TResponseModels) => {
				this.#renderModels(response as unknown as TResponseModels);
				this.calculateEstimatedPrice();
			})
			.catch(() => {
				this.sliderInstance?.slideTo(2);
				this.setActiveStep();
			});
	}

	async #submitFirstStep(url: string, formData: FormData) {
		const values = Object.fromEntries(formData);
		this.firstStepValue = values;
		this.sliderInstance?.slideTo(1);
		this.setActiveStep();
	}

	async #submitSecondStep(url: string, formData: FormData) {
		const resultFormData = formData;
		for (const [key, value] of Object.entries(this.firstStepValue)) {
			resultFormData.append(key, value);
		}
		resultFormData.append('currency', this.currency ? String(this.currency) : '₽');
		resultFormData.append(
			'resultCalculate',
			this.calculationValueElement?.textContent ? this.calculationValueElement?.textContent : '0'
		);
		this.formSecondStep.formInstance.submitButton.disabled = true;
		HTTPRequest.post(url, formData)
			.then((data) => {
				return data.json();
			})
			.then((response) => {
				this.formSecondStep.formInstance.submitButton.disabled = false;
				this.#renderResultMessageText(response);
				this.sliderInstance?.slideTo(0);
				this.setActiveStep();
			})
			.catch((data) => data);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const calculator: NodeList = document.querySelectorAll('.calculator');
	calculator.length &&
		calculator.forEach((elem) => {
			new CalculatorControl(elem as HTMLElement);
		});
});
