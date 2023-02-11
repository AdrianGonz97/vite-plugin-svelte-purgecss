import { parse, walk } from "svelte/compiler";
import { Node, NodeClassAttribute, ParentNode, Selector } from "./types";

const CLASS_REGEX = /[\w\-:./![\]]+(?<!:)/g;
const TAILWIND_REGEX = /[\w\-:./![\]]+(?<!:)/g;

const CLASS_SELECTOR = [
	"Attribute",
	"Class",
	"FromIdentifier",
	"ClassSelector",
];

export function extractSelectorsWithRegex(code: string): string[] {
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

export function extractSelectorsFromSvelte(
	template: string,
	filename?: string
): string[] {
	const ast = parse(template, { filename });
	const selectors = new Map<string, Selector>();
	const identifiers = new Set<string>();
	const ids = new Map<string, { value: string[] }>();

	walk(ast, {
		enter: (node: Node, parent: ParentNode) => {
			if (node.type === "Identifier") {
				const id = node.name;

				if (parent.init?.type === "Literal") {
					ids.set(id, { value: toArray(parent.init.value) });
				}

				if (parent.init?.type === "CallExpression") {
					parent.init.callee?.object?.elements?.forEach((element) => {
						if (element.type === "Literal") {
							ids.set(id, { value: toArray(element.value) });
						}

						if (element.type === "LogicalExpression" && element.right?.value) {
							ids.set(id, {
								value: toArray(element.right?.value),
							});
						}
					});
				}
			}

			if (node.type === "Element") {
				// <div />
				selectors.set(node.name, { type: node.type });
			}

			if (node.type === "Attribute" && node.name === "class") {
				// class="c1"
				// class="c1 c2"
				// class="{c} c1 c2 c3"
				node.value?.map((value: NodeClassAttribute) => {
					if (value.type === "MustacheTag") {
						// class="{c}"
						if (value.expression?.type === "Identifier") {
							identifiers.add(value.expression.name);
						}
					} else if (value.type === "Text") {
						// class="c1"
						value.data
							.split(/\s+/)
							.filter(Boolean)
							.forEach((selector) => {
								if (CLASS_REGEX.test(selector))
									selectors.set(selector, { type: "Class" });
							});
					}
				});
			}

			if (node.type === "Attribute") {
				// <div data-menu="features" />
				selectors.set(node.name, { type: node.type });

				if (typeof node.value === "object")
					node.value.map((value: NodeClassAttribute) => {
						if (value.type === "MustacheTag") {
							// <div data-menu="{c}" />
							if (value.expression?.type === "Identifier") {
								identifiers.add(value.expression.name);
							}
						} else if (value.type === "Text") {
							// <div data-menu="c1 c2 c3" />
							value.data
								.split(/\s+/)
								.filter(Boolean)
								.forEach((selector) => {
									if (CLASS_REGEX.test(selector))
										selectors.set(selector, {
											type: "Class",
										});
								});
						}
					});
			}

			// class:directive
			if (node.type === "Class") {
				selectors.set(node.name, { type: node.type });
			}

			if (node.type === "PseudoClassSelector" && node.name === "global") {
				// global selector
				// :global(div) {}
				node.children[0]?.value.split(",").forEach((selector: string) => {
					selectors.set(selector.trim(), {
						type: node.type,
						name: node.name,
					});
				});
			}

			// string literals
			if (node.type === "Literal" && typeof node.value === "string") {
				node.value
					.split(/\s+/)
					.filter(Boolean)
					.forEach((selector) => {
						if (selector.toLowerCase() === selector) {
							selectors.set(selector, { type: "Class" });
						}
					});
			}

			// variables used in the markup
			if (
				node.type === "TemplateElement" &&
				typeof node.value.raw === "string"
			) {
				node.value.raw
					.split(/\s+/)
					.filter(Boolean)
					.forEach((selector) => {
						if (CLASS_REGEX.test(selector)) {
							selectors.set(selector, { type: "Class" });
						}
					});
			}
		},
	});

	identifiers.forEach((id) => {
		const selector = ids.get(id);
		if (selector) {
			selector.value.forEach((value) => {
				selectors.set(value, { type: "FromIdentifier" });
			});
		}
	});

	// iterate through all class attribute identifiers
	return Array.from(selectors).map((selector) => {
		const [value, meta] = selector;
		if (CLASS_SELECTOR.includes(meta.type)) {
			return "." + value;
		}
		return value;
	});
}

function toArray(value: unknown) {
	if (typeof value === "string") {
		return value.split(/\s+/).map((value) => value.trim());
	}
	return [];
}
