import { PurgeCSS, type StringRegExpArray, type UserDefinedOptions } from 'purgecss';
import { defaultExtractor } from './extractors/default-extractor';
import type { Plugin } from 'vite';

type Extractor = (content: string) => string[];

type Options = UserDefinedOptions & {
	safelist: {
		standard: StringRegExpArray;
	};
};

const EXT_CSS = /\.(css)$/;

export function purgeCss(purgeOptions?: Options): Plugin {
	const selectors = new Set<string>();
	const standard: StringRegExpArray = [
		'*',
		'html',
		'body',
		/aria-current/,
		/^svelte-/,
		...(purgeOptions?.safelist?.standard ?? []),
	];
	const extractor = (purgeOptions?.defaultExtractor as Extractor) ?? defaultExtractor();

	return {
		name: 'vite-plugin-svelte-purgecss',
		apply: 'build',
		enforce: 'post',

		async transform(code, id) {
			if (EXT_CSS.test(id)) return { code, map: null };

			extractor(code).forEach((selector) => selectors.add(selector));
			return { code, map: null };
		},

		async generateBundle(options, bundle) {
			type ChunkOrAsset = (typeof bundle)[string];
			type Asset = Extract<ChunkOrAsset, { type: 'asset' }>;
			const assets: Record<string, Asset> = {};

			for (const [fileName, chunkOrAsset] of Object.entries(bundle)) {
				if (chunkOrAsset.type === 'asset' && EXT_CSS.test(fileName)) {
					assets[fileName] = chunkOrAsset;
				}
			}

			const selectorsArr = Array.from(selectors);

			for (const [fileName, asset] of Object.entries(assets)) {
				const purgeCSSResult = await new PurgeCSS().purge({
					...purgeOptions,
					content: [{ raw: '', extension: 'html' }],
					css: [{ raw: asset.source as string, name: fileName }],
					keyframes: true,
					fontFace: true,
					safelist: {
						...purgeOptions?.safelist,
						standard: [...standard, ...selectorsArr],
					},
				});

				if (purgeCSSResult[0]) {
					this.emitFile({
						...asset,
						source: purgeCSSResult[0].css,
					});
				}
			}
		},
	};
}

export default purgeCss;
