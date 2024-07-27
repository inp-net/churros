import { sveltekit } from '@sveltejs/kit/vite';
import houdini from 'houdini/vite';
import { fileURLToPath } from 'node:url';
import icons from 'unplugin-icons/vite';
import { defineConfig, mergeConfig } from 'vite';
import { kitRoutes } from 'vite-plugin-kit-routes';

export const commonConfig = defineConfig({
  plugins: [
    icons({
      compiler: 'svelte',
      defaultClass: 'icon',
      scale: 1.5,
      iconCustomizer(collection, icon, props) {
        if (collection === 'material-symbols-light') {
          props.width = '1.2em';
          props.height = '1.2em';
        }
      },
    }),
  ],
  resolve: {
    alias: {
      '~icons/msl': '~icons/material-symbols-light',
    },
  },
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
    plugins: [
      houdini(),
      sveltekit(),
      kitRoutes({
        format_short: true,
        format: 'route(path)',
        post_update_run: 'yarn format-at ./src/lib/ROUTES.ts',
      }),
    ],
    ssr: {
      noExternal: process.env.NODE_ENV === 'development' ? [] : ['@carbon/charts'],
    },
  }),
);
