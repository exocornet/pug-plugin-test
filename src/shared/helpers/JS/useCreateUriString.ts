export function useCreateUriString(filter: Record<string, string>) {
	let str = '';
	for (const key in filter) {
		if (str !== '') {
			str += '&';
		}
		if (Array.isArray(filter[key])) {
			for (let i = 0; i < filter[key].length; i++) {
				str += encodeURIComponent(key + '[' + i + ']') + '=' + encodeURIComponent(filter[key][i]);
				if (filter[key].length - 1 !== i) {
					str += '&';
				}
			}
		} else {
			str += encodeURIComponent(key) + '=' + encodeURIComponent(filter[key]);
		}
	}

	return str;
}
