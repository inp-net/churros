import type { StorybookConfig } from '@storybook/sveltekit';
import Icons from 'unplugin-icons/vite';

import { dirname, join } from 'path';
import { mergeConfig } from 'vite';

// https://github.com/storybookjs/storybook/issues/20562
/**
 * @param {import('vite').InlineConfig} config
 */
const workaroundSvelteDocgenPluginConflictWithUnpluginIcons = (config) => {
  if (!config.plugins) return config;

  const [_internalPlugins, ...userPlugins] = config.plugins;
  const docgenPlugin = userPlugins.find(
    (plugin) => plugin.name === 'storybook:svelte-docgen-plugin',
  );
  if (docgenPlugin) {
    const origTransform = docgenPlugin.transform;
    const newTransform = (code, id, options) => {
      if (id.startsWith('~icons/')) {
        return;
      }
      return origTransform?.call(docgenPlugin, code, id, options);
    };
    docgenPlugin.transform = newTransform;
    docgenPlugin.enforce = 'post';
  }
  return config;
};

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx|svelte)'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-interactions'),
    '@storybook/addon-svelte-csf',
  ],
  framework: {
    name: getAbsolutePath('@storybook/sveltekit'),
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config) {
    config = workaroundSvelteDocgenPluginConflictWithUnpluginIcons(config);

    // Merge custom configuration into the default config
    return mergeConfig(config, {
      plugins: [
        Icons({
          compiler: 'svelte',
        }),
      ],
      // Add dependencies to pre-optimization
      optimizeDeps: {
        include: ['storybook-dark-mode'],
      },
    });
  },
};
export default config;
