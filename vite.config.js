import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'automatic',
        }),
        laravel({
            input: ['resources/css/app.css', 'resources/js/router/index.js'],
            refresh: true,
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
        },
    },
});
