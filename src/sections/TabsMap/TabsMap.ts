import Map from '../../shared/ui/Map/Map';
import type { LngLat } from '@yandex/ymaps3-types';
import OfficeList from './OfficeList/OfficeList.pug';

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
	phoneCaption: string;
	emailCaption: string;
	addressCaption: string;
}

class TabsMap {
	block: HTMLElement;
	officeList: HTMLElement | null;
	tabsMapWrapOfficeList: HTMLElement | null;

	constructor(block: HTMLElement, classBlock: string) {
		this.block = block;
		this.officeList = this.block.querySelector(`${classBlock}__office-list`);
		this.tabsMapWrapOfficeList = this.block.querySelector(`${classBlock}__wrap-office-list`);
		this.fetchCoords();
	}

	async fetchCoords() {
		try {
			const URL = '/api/map/';
			const response = await fetch(URL);
			if (response.ok) {
				await response.json().then((response) => {
					const result = response.data;
					this.#addOfficeList(result, this.tabsMapWrapOfficeList);
					Map({ center: [85.997938, 55.347793], zoom: 12, result, addEvents: true });
					this.#addOfficeList(result, this.officeList, { isMapCard: true });
				});
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log(error);
		}
	}

	#addOfficeList(result: Coords[], blockWrap: HTMLElement | null, opt?: { isMapCard: boolean }) {
		result.forEach((item) => {
			const LinkPhoneValueArr: object[] = [];
			const phoneArray = item.phone.split(';');

			phoneArray.forEach((phoneItem) => {
				LinkPhoneValueArr.push({
					data: {
						text: phoneItem,
						tag: 'span',
						linkHref: `tel:${phoneItem.replace(/[^+\d]/g, '')}`,
					},
				});
			});

			const data = {
				data: {
					image: item.image,
					imageXs: item.imageXs,
					dataId: opt?.isMapCard && item.id,
					dataCoordinates: opt?.isMapCard && item.coordinates,
				},
				elem: {
					TextOfficeName: {
						data: {
							text: item.name,
						},
						cn: {
							size: 'bigger',
						},
					},
					TextOfficeDescription: {
						data: {
							text: item.description,
						},
						cn: {
							size: 'smaller',
							style: 'cap',
							textTransform: 'upper',
							margin: 'mt-24 mt-12@xs mb-auto',
						},
					},
					TextAddress: {
						data: {
							text: item.addressCaption,
							tag: 'span',
						},
						cn: {
							style: 'cap',
							textTransform: 'upper',
						},
					},
					TextAddressValue: {
						data: {
							text: item.address,
							tag: 'span',
						},
					},
					TextPhone: {
						data: {
							text: item.phoneCaption,
							tag: 'span',
						},
						cn: {
							style: 'cap',
							textTransform: 'upper',
						},
					},
					LinkPhoneValueArr,
					TextEmail: {
						data: {
							text: item.emailCaption,
							tag: 'span',
						},
						cn: {
							style: 'cap',
							textTransform: 'upper',
						},
					},
					LinkEmailValue: {
						data: {
							text: item.email,
							tag: 'span',
							linkHref: `mailto:${item.email}`,
						},
					},
					Link: {
						data: {
							text: item.buttonCaption,
							href: item.link,
						},
						opt: {
							icon: true,
						},
						cn: {
							margin: 'mt-24 mt-20@xs',
						},
					},
				},
				opt: {
					isImage: !opt?.isMapCard,
				},
			};

			blockWrap?.insertAdjacentHTML('beforeend', OfficeList({ data }));
			// blockWrap?.insertAdjacentHTML('beforeend', `<span>${data}</span>`);
		});
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const SELECTOR_ELEMS = '.tabs-map';
	const ELEMS: NodeListOf<HTMLElement> = document.querySelectorAll(SELECTOR_ELEMS);
	ELEMS.forEach((elem: HTMLElement) => {
		if (elem) {
			new TabsMap(elem, SELECTOR_ELEMS);
		}
	});
});
