import { sveltekit } from '@sveltejs/kit/vite';
import houdini from 'houdini/vite';
import { fileURLToPath } from 'node:url';
import icons from 'unplugin-icons/vite';
import { defineConfig, mergeConfig } from 'vite';

export const commonConfig = defineConfig({
  plugins: [
    icons({
      compiler: 'svelte',
      defaultClass: 'icon',
      scale: 1.5,
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "${fileURLToPath(
          new URL('src/design/variables.scss', import.meta.url),
        )}" as *;`,
      },
    },
  },
});

// Add svelte-kit to vite config
export default mergeConfig(
  commonConfig,
  defineConfig({
    plugins: [houdini(), sveltekit()],
    ssr: {
      noExternal: process.env.NODE_ENV === 'development' ? [] : ['@carbon/charts'],
    },
  }),
);
