import type Rollup from "rollup";
import sveltePreprocess from "svelte-preprocess";
import type { typescript as TS, postcss as PostCSS } from "svelte-preprocess";
import { preprocess } from "svelte/compiler";
import { extractSelectors } from "./extract-selectors";
import { PurgeCSS } from "purgecss";
import { EXT_SVELTE, EXT_CSS, EXT_JS } from "./constants";
import { promisify } from "util";
import { readFile } from "fs";
import { extractFromJS } from "./extract-js";

// @ts-expect-error @ts-ignore
const { typescript, postcss } = sveltePreprocess as {
	typescript: typeof TS;
	postcss: typeof PostCSS;
};

type PurgeOptions = {
	safelist: {
		standard?: Array<RegExp | string>;
		deep?: RegExp[];
		greedy?: RegExp[];
	};
};

export function purgeCss(options?: PurgeOptions): Rollup.Plugin {
	const selectors = new Set<string>();
	const standard = [
		"*",
		"html",
		"body",
		/aria-current/,
		/^svelte-/,
		...(options?.safelist?.standard ?? []),
	];
	const deep = options?.safelist?.deep ?? [];
	const greedy = options?.safelist?.greedy ?? [];

	return {
		name: "rollup-plugin-purgecss-sveltekit",
		async transform(code, id) {
			if (EXT_SVELTE.test(id)) {
				const readFiles = promisify(readFile);
				const source = await readFiles(id, "utf-8");
				const result = await preprocess(
					source,
					[typescript(), postcss()],
					{
						filename: id,
					}
				);
				extractSelectors(result.code, id).forEach((selector) =>
					selectors.add(selector)
				);
				return { code, map: null };
			}
		},
		async generateBundle(options, bundle) {
			const cssBundles: Rollup.OutputBundle = {};
			for (const fileName in bundle) {
				const chunkOrAsset = bundle[fileName];
				if (chunkOrAsset.type === "chunk" && EXT_JS.test(fileName)) {
					const classes = extractFromJS(chunkOrAsset.code);
					classes.forEach((selector) => selectors.add(selector));
				} else {
					cssBundles[fileName] = chunkOrAsset;
				}
			}

			for (const fileName in cssBundles) {
				const chunkOrAsset = bundle[fileName];
				const selectorsArr = Array.from(selectors).filter((selector) =>
					/\w/.test(selector)
				);

				if (chunkOrAsset.type === "asset" && EXT_CSS.test(fileName)) {
					const content = selectorsArr.map(
						(selector) => selector + "{}"
					);

					const newAmount = selectorsArr
						.filter(
							(selector) =>
								selector.length > 1 &&
								!selector.includes("+") &&
								!/^,|-$/.test(selector)
						)
						.map((selector) => {
							if (selector[0] === ".") {
								return selector.slice(1);
							}
							return selector;
						});

					const purgeCSSResult = await new PurgeCSS().purge({
						content: [{ raw: content.join(" "), extension: "css" }],
						css: [{ raw: chunkOrAsset.source as string }],
						keyframes: true,
						fontFace: true,
						safelist: {
							standard: [...standard, ...newAmount],
							deep,
							greedy,
						},
					});

					if (purgeCSSResult[0]) {
						this.emitFile({
							type: "asset",
							fileName,
							source: purgeCSSResult[0].css,
						});
					}
				}
			}
		},
	};
}
