import * as schemas from './schemas';
import { object } from 'yup';

export class Validation {
	constructor() {}

	static createSchemas(fields: NodeListOf<HTMLElement>) {
		return [...fields].reduce<Schema>((acc, field) => {
			const name = (field as HTMLInputElement).dataset.type as string;
			if ((schemas as unknown as Schema)[name]) {
				acc[name] = (schemas as unknown as Schema)[name];
			}
			return acc;
		}, {});
	}

	static validationAll(fields: NodeListOf<HTMLInputElement>, schema: Schema) {
		const formData = Validation.renderFormData(fields);
		const values = Object.fromEntries(formData);
		return object(schema).validate(values, { abortEarly: false });
	}

	static validationField(field: HTMLInputElement | HTMLSelectElement | HTMLDataElement) {
		const type: string | undefined = field?.dataset?.type;
		if (!field || !type) return;

		return (schemas as unknown as Schema)[type].validate(field.value);
	}

	private static renderFormData(fields: NodeListOf<HTMLInputElement>) {
		return [...fields].reduce<FormData>((acc, field) => {
			const name = field?.dataset?.type;
			name && acc.set(name, field.value);
			return acc;
		}, new FormData());
	}
}
