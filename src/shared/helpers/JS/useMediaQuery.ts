export function useMediaQuery(callbackMobile: () => void, callbackDesktop: () => void, media = 767) {
	const mediaQuery = window.matchMedia(`(max-width: ${media}px)`);

	mediaQuery.addEventListener('change', (ev: MediaQueryListEvent) => {
		const mq = ev.currentTarget as MediaQueryList;
		if (mq.matches) {
			callbackMobile();
		} else {
			callbackDesktop();
		}
	});
}
