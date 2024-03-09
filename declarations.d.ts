declare module '*.pug' {
	const template: (locals?: object) => string;
	export default template;
}

declare module 'globalInterfaces' {
	interface VideoContainer extends HTMLElement {
		videoPlayer?: VideoControl;
	}
}

interface TDataPicker extends HTMLElement {
	instance?: DatePicker;
}

interface IModal extends HTMLElement {
	modalInstance: Modal;
}

interface IForm extends HTMLFormElement {
	formInstance: Form;
}

type Schema = {
	[key: string]: ObjectSchema<{ [key: string]: string | null | undefined | object }>;
};

interface ITabs extends HTMLElement {
	instance: TabsControl;
}
