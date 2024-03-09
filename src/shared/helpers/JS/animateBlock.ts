export function fadeIn(block: HTMLElement, duration: number, maxHeight?: number): void {
	const startHeight: number = block.offsetHeight;
	const endHeight: number = maxHeight || block.scrollHeight;
	let startTime: number | null = null;

	function step(timestamp: number): void {
		if (!startTime) startTime = timestamp;
		const progress: number = (timestamp - startTime) / duration;
		block.style.height = `${startHeight + (endHeight - startHeight) * progress}px`;
		if (progress < 1) {
			requestAnimationFrame(step);
		} else {
			block.style.height = `${endHeight}px`;
		}
	}

	requestAnimationFrame(step);
}

export function fadeOut(block: HTMLElement, duration: number): void {
	const startHeight: number = block.offsetHeight;
	const endHeight: number = 0;
	let startTime: number | null = null;

	function step(timestamp: number): void {
		if (!startTime) startTime = timestamp;
		const progress: number = (timestamp - startTime) / duration;
		if (progress >= 1) {
			block.style.height = `${endHeight}px`;
			return;
		}
		const currentHeight: number = startHeight - (startHeight - endHeight) * progress;
		block.style.height = `${currentHeight}px`;
		requestAnimationFrame(step);
	}

	requestAnimationFrame(step);
}
