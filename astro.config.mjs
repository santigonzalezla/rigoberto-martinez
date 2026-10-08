// @ts-check
import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://rigobertomartinezautor.com',
    integrations: [
        react(),
        sitemap({filter: (page) => !/\/(order|download|download-unavailable)(\/|$)/.test(new URL(page).pathname)})
    ],
    output: 'server',
    adapter: vercel({
        // Los eBooks viven fuera de public/ y se empaquetan dentro de la función serverless.
        includeFiles: [
            './private/ebooks/project-monitoring.pdf',
            './private/ebooks/conchudos.pdf',
            './private/ebooks/internal-customer.pdf'
        ]
    }),
});
