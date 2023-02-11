import { ResolvedConfig, Plugin } from "vite";
import sveltePreprocess from "svelte-preprocess";
import type { typescript as TS, postcss as PostCSS } from "svelte-preprocess";
import { preprocess } from "svelte/compiler";
import {
	extractSelectorsFromSvelte,
	extractSelectorsWithRegex,
} from "./extract-selectors";
import { PurgeCSS } from "purgecss";
import { readFile } from "fs/promises";
import { join } from "path";

const EXT_SVELTE = /\.(svelte)$/;
const EXT_CSS = /\.(css)$/;
const EXT_JS = /\.(js)$/;

type PurgeOptions = {
	safelist: {
		standard?: Array<RegExp | string>;
		deep?: RegExp[];
		greedy?: RegExp[];
	};
};

export function purgeCss(options?: PurgeOptions): Plugin {
	let viteConfig: ResolvedConfig;

	// @ts-expect-error extract the preprocessors for ts and postcss
	const { typescript, postcss } = sveltePreprocess as {
		typescript: typeof TS;
		postcss: typeof PostCSS;
	};

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
		name: "vite-plugin-svelte-purgecss",
		apply: "build",
		async configResolved(config) {
			viteConfig = config;
			const path = join(config.root, "src", "app.html");
			const source = await readFile(path, "utf-8");
			const classes = extractSelectorsWithRegex(source);
			classes.forEach((selector) => selectors.add(selector));
		},
		async transform(code, id, options) {
			if (EXT_SVELTE.test(id)) {
				const source = await readFile(id, "utf-8");
				const result = await preprocess(source, [typescript(), postcss()], {
					filename: id,
				});
				extractSelectorsFromSvelte(result.code, id).forEach((selector) =>
					selectors.add(selector)
				);
				return { code, map: null };
			}
		},
		async generateBundle(options, bundle) {
			const cssBundles: typeof bundle = {};
			for (const fileName in bundle) {
				const chunkOrAsset = bundle[fileName];
				if (chunkOrAsset.type === "chunk" && EXT_JS.test(fileName)) {
					const classes = extractSelectorsWithRegex(chunkOrAsset.code);
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
					const content = selectorsArr.map((selector) => selector + "{}");

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

export default purgeCss;
