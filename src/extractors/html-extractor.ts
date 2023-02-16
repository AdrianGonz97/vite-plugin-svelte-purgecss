import { Parser } from "htmlparser2";
import { ATTRIBUTES } from "../constants";

export function extractSelectorsFromHtml(code: string): string[] {
	const selectors = new Set<string>();
	const elements = new Set<string>();
	const ids = new Set<string>();
	const parser = new Parser({
		onopentagname: (name) => {
			elements.add(name);
		},
		onattribute: (name, value, quote) => {
			// split on spaces for: class="h-full w-full etc..."
			if (name === "class") {
				value.split(" ").forEach((selector) => selectors.add(selector));
				return;
			}

			// we'll need to prepend a #
			if (name === "id") {
				ids.add(value);
				return;
			}

			// if the attribute is a reserved name, ignore it
			if (ATTRIBUTES.includes(name)) return;

			// some other attribute, we'll add both the name and value
			value
				.split(" ")
				.forEach(
					(selector) =>
						/[\w\-:./![\]]+(?<!:)/.test(selector) && selectors.add(selector)
				);

			if (/[\w\-:./![\]]+(?<!:)/.test(name)) selectors.add(name);
		},
	});
	parser.write(code);
	parser.end();

	// prepends a "#" to each id selector
	const formattedIds = Array.from(ids).map((id) => "#" + id);
	// prepends a "." to each class selector
	const formattedClasses = Array.from(selectors).map((selector) => {
		if (selector[0] === ".") {
			return selector;
		}
		return "." + selector;
	});

	return [...formattedIds, ...formattedClasses, ...Array.from(elements)];
}
