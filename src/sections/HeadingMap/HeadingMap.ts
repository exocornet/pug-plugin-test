import Map from '../../shared/ui/Map/Map';

document.addEventListener('DOMContentLoaded', () => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const data = window.coords ? window.coords : { center: [85.997938, 55.347793], zoom: 12 };
	Map(data);
});
