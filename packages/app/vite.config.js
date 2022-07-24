import { sveltekit } from '@sveltejs/kit/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import windi from 'vite-plugin-windicss';

export const commonConfig = defineConfig({
  plugins: [windi()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "${fileURLToPath(
          new URL('src/design/variables.scss', import.meta.url)
        )}" as *;`,
      },
    },
  },
});

// Add svelte-kit to vite config
export default mergeConfig(
  commonConfig,
  defineConfig({
    plugins: [sveltekit()],
  })
);
