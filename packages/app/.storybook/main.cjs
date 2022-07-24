const { mergeConfig } = require('vite');

/** @type {import('@storybook/builder-vite').StorybookViteConfig} */
module.exports = {
  stories: ['../src/**/*.stories.svelte'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-svelte-csf',
  ],
  framework: '@storybook/svelte',
  core: { builder: '@storybook/builder-vite' },
  svelteOptions: async () => (await import('../svelte.config.js')).default,
  viteFinal: async (storybookConfig) =>
    mergeConfig((await import('../vite.config.js')).commonConfig, storybookConfig),
};
