# rollup-plugin-purgecss-sveltekit

[![npm version](https://img.shields.io/npm/v/rollup-plugin-purgecss-sveltekit?logo=npm&color=cb3837)](https://www.npmjs.com/package/rollup-plugin-purgecss-sveltekit)
[![license](https://img.shields.io/badge/license-MIT-%23bada55)](https://github.com/AdrianGonz97/rollup-plugin-purgecss-sveltekit/blob/main/LICENSE)

A simple rollup plugin that **throughly** purges excess CSS from [Svelte](https://svelte.dev/) projects using [PurgeCSS](https://purgecss.com/). Excellent when combining [Tailwind](https://tailwindcss.com/) with a Tailwind specific UI library such as [Skeleton](https://skeleton.dev).

## Motivation

PurgeCSS is a great package that does its job very well. Their provided plugins for extraction do a decent job for simple projects. However, plugins such as [postcss-purgecss](https://github.com/FullHuman/purgecss/tree/main/packages/postcss-purgecss) and [rollup-plugin-purgecss](https://github.com/FullHuman/purgecss/tree/main/packages/rollup-plugin-purgecss) do their jobs rather naively. They only analyze the content that is passed to them through their `content` fields, which means that if you pass a UI library to it, none of the selectors that are **unused** in your project (such as components that aren't imported) will be properly purged. Leaving you with a larger than necessary CSS bundle.

Ideally, we'd like to only keep the selectors that are used in your project, and only the ones that are imported from a library. We accomplish this by walking Svelte's AST, extracting out any of the possible selectors (thanks to code lifted from [carbon-preprocess-svelte's](https://github.com/carbon-design-system/carbon-preprocess-svelte) `optimizeCss()` plugin), followed by the extraction of potential selectors from the emitted JS chunks from rollup. From there, we can pass along the selectors to PurgeCSS for the final extraction.

## Usage

### Installation

```bash
npm i -D rollup-plugin-purgecss-sveltekit
```

### Add to Vite

```ts
// vite.config.ts
import { purgeCss } from "rollup-plugin-purgecss-sveltekit";

const config: UserConfig = {
	plugins: [
		sveltekit(),
		process.env.NODE_ENV === "production" && purgeCss(), // we only want it to run in production
	],
};
```

If selectors that shouldn't be purged are being removed, simply add them to the safelist.

```ts
// vite.config.ts
import { purgeCss } from "rollup-plugin-purgecss-sveltekit";

const config: UserConfig = {
	plugins: [
		sveltekit(),
		process.env.NODE_ENV === "production" &&
			purgeCss({
				safelist: {
					// any selectors that begin with "hljs-" will not be purged
					greedy: [/^hljs-/],
				},
			}),
	],
};
```

## Credits

Foundationally based from [carbon-preprocess-svelte](https://github.com/carbon-design-system/carbon-preprocess-svelte) for the preprocessing of svelte components. We've added further logic to include selectors that may live in JS/TS files as well.
