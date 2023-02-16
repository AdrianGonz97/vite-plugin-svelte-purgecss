import { parse } from "acorn";

export function extractSelectorsFromJS(code: string): string[] {
	const selectors = new Set<string>();

	parse(code, {
		ecmaVersion: "latest",
		sourceType: "module",
		onToken: (token) => {
			if (token.type.label === "string") {
				const value = token.value as string;
				const classes = value.split(" ");
				classes.forEach(
					(selector) =>
						/[\w\-:./![\]]+(?<!:)/.test(selector) && selectors.add(selector)
				);
			}
		},
	});

	const formattedClasses = Array.from(selectors).map((selector) => {
		if (selector[0] === ".") {
			return selector;
		}
		return "." + selector;
	});

	return formattedClasses;
}
