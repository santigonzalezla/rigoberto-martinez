// @ts-check
import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://rigobertomartinezautor.com',
    integrations: [react(), sitemap()],
    output: 'server',
    adapter: vercel(),
});
