import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess({
      scss: {
        prependData: `@use "${
          new URL('src/design/variables.scss', import.meta.url).pathname
        }" as *;`,
      },
    }),
  ],

  kit: {
    adapter: adapter(),
    trailingSlash: 'always',
  },
};

export default config;
