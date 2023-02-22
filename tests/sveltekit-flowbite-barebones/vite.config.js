import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { purgeCss } from '../../dist/index.mjs';

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});

// without
// .svelte-kit/output/client/_app/immutable/assets/_layout-8b75cf39.css  107.76 kB │ gzip: 15.04 kB
// .svelte-kit/output/server/_app/immutable/assets/_layout-a085eefd.css  127.60 kB

// with
//.svelte-kit/output/client/_app/immutable/assets/_layout-8b75cf39.css  93.16 kB │ gzip: 13.10 kB
//.svelte-kit/output/server/_app/immutable/assets/_layout-a085eefd.css  111.42 kB
