import adapter from "@sveltejs/adapter-node";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess({
      scss: { prependData: '@use "src/variables.scss" as *;' },
    }),
  ],

  kit: {
    adapter: adapter(),
    trailingSlash: "always",
  },
};

export default config;
