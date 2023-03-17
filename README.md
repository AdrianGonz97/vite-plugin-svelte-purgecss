# vite-plugin-svelte-purgecss

[![npm version](https://img.shields.io/npm/v/vite-plugin-svelte-purgecss?logo=npm&color=cb3837)](https://www.npmjs.com/package/vite-plugin-svelte-purgecss)
[![license](https://img.shields.io/badge/license-MIT-%23bada55)](https://github.com/AdrianGonz97/vite-plugin-svelte-purgecss/blob/main/LICENSE)

A simple vite plugin that **thoroughly** purges excess CSS from [Svelte](https://svelte.dev/) projects using [PurgeCSS](https://purgecss.com/). Excellent when combining [Tailwind](https://tailwindcss.com/) with a Tailwind specific UI library such as [Skeleton](https://skeleton.dev).

## Motivation

PurgeCSS is an excellent package that removes unused CSS. Their provided plugins for extraction do a decent enough job for simple projects. However, plugins such as [postcss-purgecss](https://github.com/FullHuman/purgecss/tree/main/packages/postcss-purgecss) and [rollup-plugin-purgecss](https://github.com/FullHuman/purgecss/tree/main/packages/rollup-plugin-purgecss) take a rather naive approach to selector extraction. They only analyze the content that is passed to them through their `content` fields, which means that if you pass a UI library to it, none of the selectors that are **unused** in your project (such as components that aren't imported) will be properly purged. Leaving you with a larger than necessary CSS bundle.

Ideally, we'd like to only keep the selectors that are used in your project, and only the ones that are imported from a library. We accomplish this by walking Svelte's AST, extracting out any of the possible selectors (thanks to code lifted from [carbon-preprocess-svelte's](https://github.com/carbon-design-system/carbon-preprocess-svelte) `optimizeCss()` plugin), followed by the extraction of potential selectors from the emitted JS chunks from rollup. From there, we can pass along the selectors to PurgeCSS for final processing.

## ⚠ Caveats ⚠
This package is still very **experimental**. If you're using an additional svelte preprocessor, such as [`mdsvex`](https://github.com/pngwn/mdsvex), you may experience issues with CSS classes being unintentionally purged. In the case of `mdsvex`, classes that live in `.svx` files will have to be manually safelisted to avoid being purged.

## Usage

### Installation

```bash
npm i -D vite-plugin-svelte-purgecss
```

### Add to Vite

```ts
// vite.config.ts
import { purgeCss } from "vite-plugin-svelte-purgecss";

const config: UserConfig = {
	plugins: [sveltekit(), purgeCss()],
};
```

If selectors that shouldn't be purged are being removed, simply add them to the safelist.

```ts
// vite.config.ts
import { purgeCss } from "vite-plugin-svelte-purgecss";

const config: UserConfig = {
	plugins: [
		sveltekit(),
		purgeCss({
			safelist: {
				// any selectors that begin with "hljs-" will not be purged
				greedy: [/^hljs-/],
			},
		}),
	],
};
```

For further configuration, you can learn more about safelisting [here](https://purgecss.com/configuration.html).

## Credits

Foundationally based from [carbon-preprocess-svelte](https://github.com/carbon-design-system/carbon-preprocess-svelte) for the preprocessing of svelte components. We've added further logic to include selectors that may live in JS/TS files as well.
