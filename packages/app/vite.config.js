import { sveltekit } from '@sveltejs/kit/vite'
import windi from 'vite-plugin-windicss'

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [windi(), sveltekit()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "${new URL('src/variables.scss', import.meta.url).pathname}" as *;`,
      },
    },
  },
}

export default config
