import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { purgeCss } from '../../dist/index.mjs';

export default defineConfig({
	plugins: [
		sveltekit(),
		process.env.NODE_ENV === 'production' && purgeCss(), // only runs when building for prod
	],
});
