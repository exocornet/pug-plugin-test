/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const DIR_IMAGES = fs.readdirSync(path.join(__dirname, '../src/app/assets/img/'));

const faviconFile = DIR_IMAGES.find(function (file) {
	return file.startsWith('favicon');
});
if (!faviconFile) {
	process.stderr.write('\x1b[31mФайл с favicon не найден! \n Добавьте в директорию по пути app/assets/img\x1b[0m\n');
}

module.exports = {
	src: path.resolve(__dirname, '../src'),
	build: path.resolve(__dirname, '../build'),
	images: path.join(__dirname, '../src/app/assets/img/'),
	fonts: path.join(__dirname, '../src/app/assets/fonts/'),
	components: path.join(__dirname, '../src/components/'),
	sections: path.join(__dirname, '../src/sections/'),
	favicon: path.join(__dirname, `../src/app/assets/img/${faviconFile}`),
};
