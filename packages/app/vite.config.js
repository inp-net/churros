import { sveltekit } from '@sveltejs/kit/vite';
import { fileURLToPath } from 'node:url';
import windi from 'vite-plugin-windicss';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [windi(), sveltekit()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "${fileURLToPath(
          new URL('src/variables.scss', import.meta.url)
        )}" as *;`,
      },
    },
  },
};

export default config;
