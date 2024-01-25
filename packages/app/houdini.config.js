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
  scalars: {
    DateTime: {
      // the corresponding typescript type
      type: 'Date',
      // turn the api's response into that type
      unmarshal(val) {
        return val ? new Date(val) : null;
      },
      // turn the value into something the API can use
      marshal(date) {
        return date && date.getTime();
      },
    },
    Counts: {
      type: 'Record<string, Number>',
      unmarshal(val) {
        return JSON.parse(val);
      },
      marshal(counts) {
        return JSON.stringify(counts);
      },
    },
    BooleanMap: {
      type: 'Record<string, boolean>',
      unmarshal(val) {
        return JSON.parse(val);
      },
      marshal(BooleanMap) {
        return JSON.stringify(BooleanMap);
      },
    },
  },
};

export default config;
