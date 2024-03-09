export const HTTPRequest = {
	defaultOptions: {},

	get(url: string) {
		return fetch(url, {
			method: 'GET',
			...this.defaultOptions,
		});
	},

	post(url: string, data?: FormData) {
		return fetch(url, {
			method: 'POST',
			body: data || '',
			...this.defaultOptions,
		});
	},

	put() {},

	delete() {},
};
