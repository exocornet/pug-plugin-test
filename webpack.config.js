/* eslint-disable @typescript-eslint/no-var-requires */
const paths = require('./webpack-config/paths');
const namePages = require('./src/app/list-pages/namePages').names;
const fs = require('fs');
const path = require('path');
const PugLintPlugin = require('puglint-webpack-plugin');
const StylelintWebpackPlugin = require('stylelint-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const magicImporter = require('node-sass-magic-importer');
const TerserPlugin = require('terser-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const PugPlugin = require('pug-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const postcssSortMediaQueries = require('postcss-sort-media-queries');
const beautifyHtml = require('js-beautify').html;

let incrementalPagesWatch = null;
try {
	incrementalPagesWatch = require('./webpack-config/incremental-pages-watch');
} catch {
	incrementalPagesWatch = false;
}

const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'watch';
let plugins = [];
let links = [];
let listPages = {};
const optionsMinimizer = [
	new TerserPlugin({
		test: /\.js(\?.*)?$/i,
		terserOptions: {
			format: {
				comments: false,
			},
		},
		extractComments: false,
		parallel: true,
	}),
	new ImageMinimizerPlugin({
		minimizer: {
			implementation: ImageMinimizerPlugin.imageminMinify,
			options: {
				plugins: [
					['gifsicle', { interlaced: true }],
					['mozjpeg', { quality: 85 }],
					['pngquant', { optimizationLevel: 6 }],
					//TODO разораться с оптимизацией SVG
					/*[
						'svgo',
						{
							plugins: [
								{
									name: 'preset-default',
									params: {
										overrides: {
											removeViewBox: false,
											addAttributesToSVGElement: {
												params: {
													attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
												},
											},
										},
									},
								},
							],
						},
					],*/
				],
			},
		},
	}),
];

const arrPages = process.env.NODE_ENV === 'watch' ? incrementalPagesWatch : fs.readdirSync(`${paths.src}/pages/`);
arrPages.forEach((dirPage) => {
	let arrPage = [];
	if (path.extname(dirPage) === '') {
		arrPage = fs.readdirSync(`${paths.src}/pages/${dirPage}/`);
	}

	arrPage.forEach((page) => {
		if (path.extname(page) === '.pug') {
			// Преобразование страниц pug в html
			listPages = Object.assign({ ...listPages }, { [`${dirPage}`]: `src/pages/${dirPage}/${page}` });

			// Создание объекта с данными страниц
			links.push({
				link: `./${dirPage}.html`,
				title: dirPage,
				name: `${namePages(page)}`,
			});
		}
	});
});

plugins.push(
	new CopyWebpackPlugin({
		patterns: [
			{
				from: 'src/app/public',
				to: './public',
			},
		],
	})
);

plugins.push(
	new PugPlugin({
		data: {
			listLinks: links,
			jsPath: isDev ? './assets/js' : './assets/js',
			cssPath: isDev ? './assets/css' : './assets/css',
			media: {
				xs: '767px',
				md: '1599px',
			},
		},
		js: {
			filename: 'assets/js/[name].js',
		},
		css: {
			filename: 'assets/css/[name].css',
		},
		postprocess(content) {
			return beautifyHtml(content, {
				indent_size: 2,
				indent_char: ' ',
				indent_with_tabs: true,
				editorconfig: true,
			});
		},
	}),

	new PugLintPlugin({
		context: 'src',
		files: '**/*.pug',
		config: Object.assign({ emitError: true }, require('./.pug-lintrc.json')),
	}),
	new StylelintWebpackPlugin({
		configFile: '.stylelintrc.json',
		context: 'src',
		files: '**/*.scss',
		failOnError: false,
		quiet: false,
	}),
	new ESLintPlugin({
		context: 'src',
		extensions: 'js',
		fix: true,
		failOnError: false,
		quiet: true,
	})
);

module.exports = {
	cache: isDev ? { type: 'memory' } : false,
	mode: isDev ? 'development' : 'production',
	entry: {
		'list-pages': 'src/app/list-pages/list-pages.pug',
		...listPages,
	},
	output: {
		path: `${paths.build}`,
		publicPath: isDev ? '/' : './',
		clean: true,
	},
	resolve: {
		extensions: ['.js', '.tsx', '.ts'],
		alias: {
			IMAGES: `${paths.images}`,
			FONTS: `${paths.fonts}`,
			COMPONENTS: `${paths.components}`,
			SECTIONS: `${paths.sections}`,
			FAVICON: `${paths.favicon}`,
		},
	},
	stats: {
		children: true,
		errorDetails: true,
		loggingDebug: ['sass-loader'],
	},
	devtool: isDev ? 'eval-source-map' : false,
	devServer: {
		static: './build',
		client: {
			progress: true,
			overlay: {
				errors: true,
				warnings: false,
			},
		},
		historyApiFallback: true,
		open: 'list-pages.html',
		compress: true,
		hot: true,
		port: 8081,
		watchFiles: 'src/**/*',
		setupMiddlewares: (middlewares, devServer) => {
			devServer.app.get('/api/map/', function (req, res) {
				const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/mapCoords.json'));
				res.json(JSON.parse(data));
			});
			devServer.app.get('/api/transport/types/', function (req, res) {
				const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/calculatorTypes.json'));
				res.json(JSON.parse(data));
			});
			devServer.app.get('/api/transport/types/:typeId/models/', function (req, res) {
				let data;
				switch (+req.params.typeId) {
					case 29:
						data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/calculatorType2.json'));
						break;
					case 30:
						data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/calculatorType3.json'));
						break;
					default:
						data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/calculatorType1.json'));
						break;
				}
				//let data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/calculator2.json'));
				res.json(JSON.parse(data));
			});
			devServer.app.get('/api/fos/', function (req, res) {
				const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/dataFosApi.json'));
				res.json(JSON.parse(data));
			});
			devServer.app.post('/api/forms/callback', function (req, res) {
				const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/dataFormApi.json'));
				res.json(JSON.parse(data));
			});
			devServer.app.get('/api/events-dates/:id/', function (req, res) {
				let data;
				if (req.params.id === 'transport') {
					data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/dateCalculator.json'));
				} else {
					data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/dateForm.json'));
				}
				res.json(JSON.parse(data));
			});
			devServer.app.get('/api/subscription/', function (req, res) {
				const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/dataSubscriptionApi.json'));
				res.json(JSON.parse(data));
			});

			// [START]==> api-fake search
			devServer.app.get('/api/search/history/', function (req, res) {
				const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/dataSearchHistory.json'));
				res.json(JSON.parse(data));
			});
			devServer.app.get('/api/search/top/', function (req, res) {
				const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/dataSearchPopular.json'));
				res.json(JSON.parse(data));
			});
			devServer.app.get('/api/search/result/', function (req, res) {
				const paramValueQ = req.query.q;
				const paramValueFull = req.query.full;

				if (!paramValueQ) {
					return res.json({ param: '' });
				}

				if (!paramValueFull) {
					const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/searchHeaderApi.json'));
					res.json(JSON.parse(data));
				} else {
					const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/searchApi.json'));
					res.json(JSON.parse(data));
				}
			});
			// api-fake search <==[END]

			// [START]==> api-fake catalog
			devServer.app.get('/catalog/', function (req, res) {
				const paramValueSearch = req.query.search;

				if (paramValueSearch) {
					const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/searchCatalog.html')).toString();
					res.write(data);
					res.end();
				} else {
					const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/contentCatalog.html')).toString();
					res.write(data);
					res.end();
				}
			});
			devServer.app.get('/catalog/:id/', function (req, res) {
				const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/contentCatalog.html')).toString();
				res.write(data);
				res.end();
			});
			// api-fake catalog <==[END]

			// [START]==> api-fake all-nvi-sale
			devServer.app.get('/all-nvi-sale', function (req, res) {
				const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/contentFilterNvi.html')).toString();
				res.write(data);
				res.end();
			});
			devServer.app.get('/all-nvi-sale/:id/', function (req, res) {
				const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/contentFilterNvi.html')).toString();
				res.write(data);
				res.end();
			});
			// api-fake all-nvi-sale <==[END]

			// [START]==> api-fake cases
			devServer.app.get('/cases/:id/', function (req, res) {
				const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/contentCases.html')).toString();
				res.write(data);
				res.end();
			});
			devServer.app.get('/select-cases/:id/', function (req, res) {
				const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/selectCasesApi.json'));
				res.json(JSON.parse(data));
			});
			// api-fake cases <==[END]

			// [START]==> api-fake news
			devServer.app.get('/news', function (req, res) {
				const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/contentFilterNews.html')).toString();
				res.write(data);
				res.end();
			});
			devServer.app.get('/news/:id', function (req, res) {
				const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/contentFilterNews.html')).toString();
				res.write(data);
				res.end();
			});
			// api-fake news <==[END]

			// [START]==> api-fake newspaper
			devServer.app.get('/newspaper', function (req, res) {
				const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/contentNewspaper.html')).toString();
				res.write(data);
				res.end();
			});
			devServer.app.get('/newspaper/:id/', function (req, res) {
				const data = fs.readFileSync(path.join(__dirname, 'src/app/public/fake-api/contentNewspaper.html')).toString();
				res.write(data);
				res.end();
			});
			// api-fake newspaper <==[END]

			// [START]==> api-fake vacancies
			devServer.app.get('/vacancies/', function (req, res) {
				const data = fs
					.readFileSync(path.join(__dirname, 'src/app/public/fake-api/contentFilterVacancies.html'))
					.toString();
				res.write(data);
				res.end();
			});
			// api-fake vacancies <==[END]

			// [START]==> api-fake purchase-realization
			devServer.app.get('/purchase-realization/:id', function (req, res) {
				let data;
				switch (req.params.id) {
					case 'archive':
						data = fs
							.readFileSync(path.join(__dirname, 'src/app/public/fake-api/PurchaseContainerArchive.html'))
							.toString();
						break;
					case 'production':
						data = fs
							.readFileSync(path.join(__dirname, 'src/app/public/fake-api/PurchaseContainerImplementation.html'))
							.toString();
						break;
					case 'purchase':
						data = fs
							.readFileSync(path.join(__dirname, 'src/app/public/fake-api/PurchaseContainerPurchase.html'))
							.toString();
						break;
					default:
						break;
				}
				res.write(data);
				res.end();
			});
			// api-fake purchase-realization <==[END]

			return middlewares;
		},
	},
	module: {
		rules: [
			// {
			// 	test: /\.js$/,
			// 	exclude: /node_modules/,
			// 	use: ['babel-loader'],
			// },
			{
				test: /\.ts?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.(jpe?g|png|gif|svg|webp)$/i,
				type: 'asset/resource',
				exclude: /fonts/,
				generator: {
					filename: 'assets/img/[name][ext]',
				},
			},
			{
				test: /\.(woff(2)?|eot|ttf|otf|svg)$/,
				exclude: /img/,
				type: 'asset/resource',
				generator: {
					filename: 'assets/fonts/[name][ext]',
				},
			},
			{
				test: /\.(s[ac]ss|css)$/i,
				use: [
					{
						loader: 'css-loader',
						options: {
							sourceMap: isDev,
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: isDev,
							postcssOptions: {
								plugins: [postcssSortMediaQueries()],
							},
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sassOptions: {
								importer: magicImporter(),
							},
							sourceMap: isDev,
						},
					},
				],
			},
		],
	},
	optimization: {
		minimize: !isDev,
		minimizer: !isDev ? optionsMinimizer : [],
	},
	plugins: plugins,
};
