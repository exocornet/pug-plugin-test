import type { LngLat, YMapMarker, YMap, YMapLocationRequest, YMapCameraRequest } from '@yandex/ymaps3-types';
import { useMediaQuery } from '../../helpers/JS/useMediaQuery';

interface Options {
	center: LngLat;
	zoom: number;
	result?: Coords[];
	addEvents?: boolean;
}

interface Coords {
	id: number;
	name: string;
	description: string;
	address: string;
	phone: string;
	coordinates: LngLat;
	email: string;
	image: string;
	imageXs: string;
	link: string;
	buttonCaption: string;
}

class MapControl {
	mainCenter: LngLat;
	mainZoom: number;
	baloonElement: (coordinates: string, id: number) => HTMLDivElement;
	baloonIcon: string;
	options: Options;
	addEvents?: boolean = false;
	result?: Coords[];

	constructor(block: HTMLElement, options: Options) {
		this.baloonElement = this.mapBaloon;
		this.baloonIcon =
			'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzkiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzOSA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE5LjcxMDkgNDhDMTMuMzM4IDQyLjUyIDguNTc4MTMgMzcuNDMgNS40MzEyNSAzMi43M0MyLjI4NDM4IDI4LjAzIDAuNzEwOTM4IDIzLjY4IDAuNzEwOTM4IDE5LjY4QzAuNzEwOTM4IDEzLjY4IDIuNjIwODMgOC45IDYuNDQwNjMgNS4zNEMxMC4yNjA0IDEuNzggMTQuNjgzOSAwIDE5LjcxMDkgMEMyNC43MzggMCAyOS4xNjE1IDEuNzggMzIuOTgxMyA1LjM0QzM2LjgwMSA4LjkgMzguNzEwOSAxMy42OCAzOC43MTA5IDE5LjY4QzM4LjcxMDkgMjMuNjggMzcuMTM3NSAyOC4wMyAzMy45OTA2IDMyLjczQzMwLjg0MzggMzcuNDMgMjYuMDgzOSA0Mi41MiAxOS43MTA5IDQ4WiIgZmlsbD0iIzQzQkQyNSIvPgo8L3N2Zz4K';
		this.mainCenter = options.center;
		this.mainZoom = options.zoom;
		this.result = options?.result;
		this.addEvents = options?.addEvents;
		this.initMap(block, options);
	}

	async initMap(block: HTMLElement, options: Options) {
		await ymaps3.ready;
		const { YMap, YMapDefaultSchemeLayer, YMapControls, YMapDefaultFeaturesLayer, YMapMarker } = ymaps3;

		// Map Initialization
		const map = new YMap(block, {
			location: {
				...options,
			},
			behaviors: ['drag', 'pinchZoom', 'dblClick'],
		});
		map.addChild(new YMapDefaultFeaturesLayer({}));

		// Map Customization
		map.addChild(
			new YMapDefaultSchemeLayer({
				customization: [
					{
						tags: {
							any: ['poi', 'transit', 'landscape'],
						},
						elements: ['geometry', 'label'],
						stylers: [{ saturation: -1 }],
					},
					{
						tags: {
							all: ['road'],
						},
						types: 'polyline',
						elements: 'geometry',
						stylers: [{ saturation: -1 }],
					},
				],
			})
		);

		// Map Controls
		const { YMapZoomControl } = await ymaps3.import('@yandex/ymaps3-controls@0.0.1');

		const zoomControl = new YMapControls({ position: 'right', orientation: 'vertical' }).addChild(
			new YMapZoomControl({})
		);

		useMediaQuery(
			() => {
				zoomControl.update({ position: 'right', orientation: 'vertical' });
			},
			() => {
				zoomControl.update({ position: 'right bottom', orientation: 'vertical' });
			}
		);
		map.addChild(zoomControl);

		// Отрисовка всех маркеров, если в Options есть result, или маркера по умолчанию
		if (this.result) {
			this.result.forEach((item) => {
				const marker = new YMapMarker(
					{ coordinates: item.coordinates },
					this.mapBaloon(item.coordinates.toString(), item.id)
				);
				this.addMarker(map, marker);
			});
			map.update({
				location: {
					bounds: [
						[27.546084, 55.895186],
						[103.943199, 55.347793],
					],
				},
			});

			if (this.addEvents) {
				// триггер. Если true - навешиваются события клика на Baloon.
				addListeners();
			}
		} else {
			const MAIN_BALOON_COORDS = {
				coordinates: this.mainCenter,
			};
			const marker = new YMapMarker(
				MAIN_BALOON_COORDS,
				this.baloonElement(MAIN_BALOON_COORDS.coordinates.toString(), 1)
			);
			this.addMarker(map, marker);
		}

		// Отслеживание клика по карточке офиса на карте и Baloon
		function addListeners() {
			document.addEventListener('click', (e: Event) => {
				// Office click
				const element = e.target as HTMLElement;
				if (!element.hasAttribute('data-coordinates')) return;
				const id = Number(element.dataset.id);

				makeMarkerActive(id);

				setLocationWithClick(element);
			});

			document.addEventListener('click', (e: Event) => {
				// Baloon Click
				const element = e.target as HTMLElement;
				if (!element.classList.contains('map__baloon')) return;

				const id = Number(element.dataset.id);

				makeMarkerActive(id);
				selectOffice(id);

				setLocationWithClick(element);
			});
		}

		// Увеличение размера активного маркера
		const makeMarkerActive = (id: number | undefined) => {
			const allMarkers = document.querySelectorAll('.map__baloon');
			allMarkers.forEach((item) => item.classList.remove('map__baloon_scaled'));
			const currentBaloon = Array.from(allMarkers).filter((item) => Number(item.getAttribute('data-id')) == id);
			currentBaloon[0].classList.add('map__baloon_scaled');
		};

		// подсветка активного офиса на карте
		const selectOffice = (id: number | undefined) => {
			const allOffices = document.querySelectorAll('.tabs-map__office-list .office__wrap');
			const officeWrap = document.querySelector('.tabs-map__office-list') as HTMLElement;
			const officeArray = Array.from(allOffices) as HTMLElement[];
			const currentOffice = officeArray.filter((item) => Number(item.getAttribute('data-id')) == id);

			currentOffice[0].classList.add('tabs-map__office-item_green');
			setTimeout(() => {
				currentOffice[0].classList.remove('tabs-map__office-item_green');
			}, 1000);

			if (window.innerWidth > 767) {
				officeWrap.scrollTop = currentOffice[0].offsetTop;
			} else {
				officeWrap.scrollLeft = currentOffice[0].offsetLeft;
			}
		};

		// изменение позиции камеры по клику на Baloon или карточку офиса
		const setLocationWithClick = (element: HTMLElement) => {
			const coords = element.dataset.coordinates?.split(',');
			const newCoords = coords?.map((item) => parseFloat(item.replace(/[^.\d]/g, '')));

			const location = {
				center: newCoords,
				zoom: 4,
			};

			changeMapPosition(location, { tilt: 0 });
		};
		const changeMapPosition = (location: YMapLocationRequest, camera: YMapCameraRequest) => {
			map.update({ location: { ...location, duration: 1000 }, camera });
		};
	}

	// Adding several Markers
	addMarker(map: YMap, marker: YMapMarker) {
		map.addChild(marker);
	}

	// Creates Baloon Element
	mapBaloon(coordinates: string, id: number) {
		const baloon = document.createElement('div');
		baloon.setAttribute('data-coordinates', coordinates);
		baloon.setAttribute('data-id', id.toString());
		baloon.classList.add('map__baloon');
		baloon.style.backgroundImage = `url(${this.baloonIcon})`;

		return baloon;
	}
}

export default function Map(options?: Options): void {
	const elems = document.querySelectorAll('.map');
	elems.forEach((elem: Element) => {
		new MapControl(elem as HTMLElement, options as Options);
	});
}
