import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import houdini from 'houdini/vite';
import { fileURLToPath } from 'node:url';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import icons from 'unplugin-icons/vite';
import { defineConfig, mergeConfig } from 'vite';
import { kitRoutes } from 'vite-plugin-kit-routes';

export const commonConfig = defineConfig({
  plugins: [
    icons({
      compiler: 'svelte',
      defaultClass: 'icon',
      scale: 1.5,
      customCollections: {
        'custom-logos': FileSystemIconLoader('./src/lib/logos'),
      },
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
        api: 'moden-compiler',
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
      sentrySvelteKit({
        sourceMapsUploadOptions: {
          project: 'app',
          release: {
            inject: true,
            name: process.env.TAG,
          },
          unstable_sentryVitePluginOptions: {
            release: {
              setCommits: {
                auto: true,
              },
            },
          },
        },
      }),
      sveltekit(),
      kitRoutes({
        format_short: true,
        format: 'route(path)',
        post_update_run: 'yarn format-at ./src/lib/ROUTES.ts',
        PAGES: {
          '/login': {
            explicit_search_params: {
              bypass_oauth: { type: "undefined | '1'", default: 'undefined' },
            },
          },
          '/events/[id]/bookings': {
            explicit_search_params: {
              tab: { type: '"unpaid" | "paid" | "verified"', default: '"unpaid"' },
            },
          },
          '/[uid=uid]': {
            explicit_search_params: {
              tab: {
                type: '"infos" | "members" | "family" | "see-also" | "groups" | "services" | "majors" | "subjects" | "boards"',
                default: '"infos"',
              },
            },
          },
          '/logout': {
            explicit_search_params: {
              userWasDeleted: {
                type: '"1" | undefined',
                default: 'undefined',
              },
            },
          },
        },
      }),
    ],
    ssr: {
      noExternal: process.env.NODE_ENV === 'development' ? [] : ['@carbon/charts'],
    },
  }),
);
