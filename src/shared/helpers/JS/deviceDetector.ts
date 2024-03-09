interface DeviceInfo {
	IS_ANDROID: boolean;
	IS_APPLE: boolean;
	IS_APPLE_MOBILE: boolean;
	IS_CHROMIUM: boolean;
	IS_FIREFOX: boolean;
	IS_MOBILE: boolean;
	IS_MOBILE_SAFARI: boolean;
	IS_SAFARI: boolean;
	USER_AGENT: string | null;
}

interface DeviceDetector {
	detect: () => DeviceInfo;
}

const deviceDetector: DeviceDetector = {
	detect: () => {
		const MT = typeof window < 'u' ? window : self;
		const USER_AGENT = navigator ? navigator.userAgent : null;
		const IS_APPLE = navigator.userAgent.search(/OS X|iPhone|iPad|iOS/i) !== -1;
		const IS_ANDROID = navigator.userAgent.toLowerCase().indexOf('android') !== -1;
		const IS_CHROMIUM = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
		const IS_APPLE_MOBILE =
			(/iPad|iPhone|iPod/.test(navigator.platform) ||
				(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			!MT.MSStream;
		const IS_SAFARI =
			'safari' in MT ||
			!!(
				USER_AGENT &&
				(/\b(iPad|iPhone|iPod)\b/.test(USER_AGENT) || (USER_AGENT.match('Safari') && !USER_AGENT.match('Chrome')))
			);
		const IS_FIREFOX = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
		const IS_MOBILE_SAFARI = IS_SAFARI && IS_APPLE_MOBILE;
		const IS_MOBILE =
			(navigator.maxTouchPoints === void 0 || navigator.maxTouchPoints > 0) &&
			navigator.userAgent.search(
				/iOS|iPhone OS|Android|BlackBerry|BB10|Series ?[64]0|J2ME|MIDP|opera mini|opera mobi|mobi.+Gecko|Windows Phone/i
			) != -1;

		return Object.freeze(
			Object.defineProperty(
				{
					__proto__: null,
					IS_ANDROID,
					IS_APPLE,
					IS_APPLE_MOBILE,
					IS_CHROMIUM,
					IS_FIREFOX,
					IS_MOBILE,
					IS_MOBILE_SAFARI,
					IS_SAFARI,
					USER_AGENT,
				},
				Symbol.toStringTag,
				{
					value: 'Module',
				}
			)
		);
	},
};

export default deviceDetector;
