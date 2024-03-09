// # ПОДКЛЮЧЕНИЕ JS ДЛЯ SHARED # //
import { Slider, NavTabs, Tabs, More, Accordion, Select, InputNumber } from '../shared';

// # ПОДКЛЮЧЕНИЕ JS ДЛЯ FEATURES # //
import { Header } from '../features';

document.addEventListener('DOMContentLoaded', () => {
	// # ВЫЗОВ JS ДЛЯ SHARED # //
	Slider();
	NavTabs();
	Tabs();
	More();
	Accordion();
	Select();
	InputNumber();

	// # ВЫЗОВ JS ДЛЯ FEATURES # //
	Header();
});
