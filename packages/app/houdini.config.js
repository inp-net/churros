/** @type {import("houdini").ConfigFile} */
const config = {
  schemaPath: 'schema.graphql',
  // apiUrl: 'env:PUBLIC_API_URL',
  watchSchema: {
    url: 'env:PUBLIC_API_URL',
  },
  plugins: {
    'houdini-svelte': {
      client: './src/lib/client',
    },
  },
};

export default config;
