/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const PAGES_OBJECT = {
	'index': 'Главная',
	'about': 'О компании',
	'history': 'История',
	'management': 'Управление компанией',
	'mission': 'Миссия и ценности',
	'invest': 'Инвестиционные проекты. Детальная страница',
	'goals-and-strategies': 'Цели и стратегия компании',
	'supervisor': 'Детальная страница руководителя',
	'about-group-companies': 'О группе компаний',
	'information-disclosure': 'Раскрытие информации',
	'purchasing-policy': 'Политика по закупкам',
	'career': 'Карьера',
	'about-kemerovo': 'О Кемерово',
	'vacancies-list': 'Вакансии. Список',
	'vacancies-detailed': 'Вакансии. Детальная страница',
	'company-programs-list': 'Программы компании. Список',
	'company-programs-detailed': 'Программы компании. Детальная страница',
	'corporate-university-programs': 'Программы корпоративного университета',
	'schoolchildren-students-graduates': 'Школьникам, студентам, выпускникам',
	'success-story-detailed': 'История успеха. Детальная страница',
	'sustainable-development': 'Устойчивое развитие',
	'achievement-tsur-oon': 'Наши достижения ЦУР ООН',
	'social-responsibility': 'Страница «Социальная ответственность»',
	'buyers': 'Покупателям',
	'sale-unclaimed-raw-materials': 'Продажа невостребованного сырья компании',
	'all-nvi-sale': 'Все НВИ на продажу',
	'catalog': 'Каталог',
	'catalog-detailed': 'Каталог. Детальная страница продукта',
	'transportation-services': 'Услуги транспорта',
	'cases-articles-list': 'Кейсы/Статьи. Список',
	'trade-policy': 'Торговая политика',
	'suppliers': 'Поставщикам',
	'purchase-realization': 'Закупка и реализация',
	'press-center': 'Пресс-центр',
	'news': 'Новости',
	'news-detailed': 'Новости. Детальная страница',
	'media': 'Медиа',
	'newspaper-archive': 'Архив выпусков газеты',
	'press-kit': 'Пресс-кит',
	'contacts': 'Контакты',
	'typical-text-page': 'Текстовая типовая страница',
	'searching-results': 'Результаты поиска',
};

module.exports = {
	names: (page) => {
		return PAGES_OBJECT[path.basename(page, '.pug')] || 'name page';
	},
};
