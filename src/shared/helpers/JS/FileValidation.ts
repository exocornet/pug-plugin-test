type TValidationResult = {
	error?: string;
	status: boolean;
};

export default class FileValidation {
	private readonly typesFile = ['doc', 'docx', 'pdf', 'zip'];
	private readonly maxFileSize = 10 * 1024 * 1024;

	constructor(private readonly field: HTMLInputElement) {}

	async validation(): Promise<TValidationResult> {
		if (this.field && this.field.files) {
			const file = this.field.files[0];

			if (!this.field?.dataset.required && !file) {
				return Promise.resolve({ status: true });
			}

			const result: Awaited<TValidationResult>[] = await Promise.all([
				this.#validationEmpty(file),
				this.#validationSize(file),
				this.#validationType(file),
			]);

			return Array.isArray(result) ? Promise.resolve({ status: true }) : Promise.resolve(result);
		}
		return Promise.resolve({ status: true });
	}

	#validationEmpty(file: File): Promise<TValidationResult> {
		return new Promise((resolve, reject) => {
			if (!file) {
				reject({ error: 'required', status: false });
			} else {
				resolve({ status: true });
			}
		});
	}

	#validationType(file: File): Promise<TValidationResult> {
		return new Promise((resolve, reject) => {
			const type = file.name.split('.')[1];
			const isValid = this.typesFile.includes(type);

			if (isValid) {
				resolve({ status: true });
			} else {
				reject({ error: 'fileType', status: false });
			}
		});
	}

	#validationSize(file: File): Promise<TValidationResult> {
		return new Promise((resolve, reject) => {
			file.size <= this.maxFileSize ? resolve({ status: true }) : reject({ error: 'fileSize', status: false });
		});
	}
}
