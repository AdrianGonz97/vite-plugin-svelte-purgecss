import { TAILWIND_REGEX } from "./constants";

export function extractFromJS(code: string): string[] {
	const classes = new Set<string>();

	const selectors = code.match(TAILWIND_REGEX) ?? [];
	selectors.forEach((selector) => classes.add(selector));

	// adds a dot to the beginning of each class
	return Array.from(classes).map((selector) => {
		if (selector[0] === ".") {
			return selector;
		}
		return "." + selector;
	});
}
