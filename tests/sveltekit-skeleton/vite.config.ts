import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { purgeCss } from '../../dist/index.mjs';

const config: UserConfig = {
	plugins: [sveltekit(), process.env.NODE_ENV === 'production' && purgeCss()]
};

export default config;
