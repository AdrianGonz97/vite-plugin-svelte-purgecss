export * from './html-extractor';
export * from './svelte-extractor';
export * from './js-extractor';

export function extractSelectorsWithRegex(code: string): string[] {
	const classes = new Set<string>();
	const TAILWIND_REGEX = /[\w\-:./![\]]+(?<!:)/g;

	const selectors = code.match(TAILWIND_REGEX) ?? [];

	selectors.forEach((selector) => classes.add(selector));

	// adds a dot to the beginning of each class
	return Array.from(classes).map((selector) => {
		if (selector[0] === '.') {
			return selector;
		}
		return '.' + selector;
	});
}
