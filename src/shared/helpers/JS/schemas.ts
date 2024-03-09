import * as yup from 'yup';

const phoneRegExp = /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/im; // eslint-disable-line
const dateRegExp = /^(0[1-9]|1[0-9]|2[0-9]|3[0-1])\.(0[1-9]|1[0-2]),\s([01][0-9]|2[0-3]):[0-5][0-9]$/; // eslint-disable-line
const emailRegExp =
	/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const theme = yup.string().required('required');
export const transport = yup.string().required('required');
export const invoice = yup.string().required('required');
export const stream = yup.string().required('required');
export const number = yup.string().required('required');
export const email = yup.string().required('required').matches(emailRegExp, 'wrongEmail');
export const name = yup.string().required('required');
export const transportDate = yup.string().required('required');
export const phoneRu = yup.string().required('required').matches(phoneRegExp, 'wrongPhone').min(16, 'wrongPhone');
export const phoneAll = yup.string().required('required').min(13, 'wrongPhone');
export const company = yup.string().nullable();
export const comment = yup.string().nullable();
export const question = yup.string().nullable();
export const direct = yup.string().nullable();
export const course = yup.string().nullable();
export const manager = yup.string().nullable();
export const date = yup.string().matches(dateRegExp, 'wrongDate');
export const institution = yup.string().required('required');
export const period = yup.string().required('required');
export const file = yup.mixed().nullable();
export const numberOfCars = yup.string().required('required');
export const numberOfHours = yup.string().required('required');
export const transportRegion = yup.string().required('required');
export const transportModel = yup.string().required('required');
export const transportType = yup.string().required('required');

export const text = yup.string().nullable();
