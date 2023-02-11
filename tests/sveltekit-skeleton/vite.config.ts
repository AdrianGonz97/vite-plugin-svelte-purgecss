import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { purgeCss } from '../../dist/index.mjs';

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
});
