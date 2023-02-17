import sveltePreprocess from 'svelte-preprocess';
import type { typescript as TS, postcss as PostCSS } from 'svelte-preprocess';
import { preprocess } from 'svelte/compiler';
import { PurgeCSS } from 'purgecss';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { EXT_CSS, EXT_JS, EXT_SVELTE } from './constants';
import {
	extractSelectorsFromHtml,
	extractSelectorsFromJS,
	extractSelectorsFromSvelte,
} from './extractors';
import type { StringRegExpArray, ComplexSafelist } from 'purgecss';
import type { ResolvedConfig, Plugin } from 'vite';

type PurgeOptions = {
	safelist?: ComplexSafelist;
	blocklist?: StringRegExpArray;
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
		'*',
		'html',
		'body',
		/aria-current/,
		/^svelte-/,
		...(options?.safelist?.standard ?? []),
	];
	const deep = options?.safelist?.deep ?? [];
	const greedy = options?.safelist?.greedy ?? [];
	const blocklist = options?.blocklist ?? [];

	return {
		name: 'vite-plugin-svelte-purgecss',
		apply: 'build',
		enforce: 'post',

		async configResolved(config) {
			viteConfig = config;
			const path = join(config.root, 'src', 'app.html');
			const source = await readFile(path, 'utf-8');
			const classes = extractSelectorsFromHtml(source);
			classes.forEach((selector) => selectors.add(selector));
		},

		async transform(code, id, options) {
			if (EXT_SVELTE.test(id)) {
				const source = await readFile(id, 'utf-8').catch(() => null);
				if (!source) return { code, map: null };

				const result = await preprocess(source, [typescript(), postcss()], {
					filename: id,
				});

				const svelteSelectors = extractSelectorsFromSvelte(result.code, id);
				svelteSelectors.forEach((selector) => selectors.add(selector));

				return { code, map: null };
			}
		},

		async generateBundle(options, bundle) {
			type ChunkOrAsset = (typeof bundle)[string];
			type Asset = Extract<ChunkOrAsset, { type: 'asset' }>;
			const assets: Record<string, Asset> = {};
			for (const [fileName, chunkOrAsset] of Object.entries(bundle)) {
				if (chunkOrAsset.type === 'chunk' && EXT_JS.test(fileName)) {
					const classes = extractSelectorsFromJS(chunkOrAsset.code);
					classes.forEach((selector) => selectors.add(selector));
				} else if (chunkOrAsset.type === 'asset' && EXT_CSS.test(fileName)) {
					assets[fileName] = chunkOrAsset;
				}
			}

			for (const [fileName, asset] of Object.entries(assets)) {
				const selectorsArr = Array.from(selectors).filter((selector) => /\w/.test(selector));

				const content = selectorsArr.map((selector) => selector + '{}');

				const newAmount = selectorsArr
					.filter(
						(selector) => selector.length > 1 && !selector.includes('+') && !/^,|-$/.test(selector)
					)
					.map((selector) => {
						if (selector[0] === '.') {
							return selector.slice(1);
						}
						return selector;
					});

				const purgeCSSResult = await new PurgeCSS().purge({
					content: [{ raw: content.join(' '), extension: 'css' }],
					css: [{ raw: asset.source as string }],
					keyframes: true,
					fontFace: true,
					safelist: {
						standard: [...standard, ...newAmount],
						deep,
						greedy,
					},
					blocklist,
				});

				if (purgeCSSResult[0]) {
					this.emitFile({
						type: 'asset',
						fileName,
						source: purgeCSSResult[0].css,
					});
				}
			}
		},
	};
}

export default purgeCss;
