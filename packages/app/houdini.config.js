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
  defaultCachePolicy: 'CacheAndNetwork',
  defaultLifetime: 60e3,
  defaultPaginateMode: 'Infinite',
  types: {
    User: {
      resolve: {
        queryField: 'user',
        arguments: ({ uid }) => ({ uid }),
      },
    },
    Article: {
      resolve: {
        queryField: 'article',
      },
    },
    Comment: {
      resolve: {
        queryField: 'comment',
      },
    },
    Page: {
      resolve: {
        queryField: 'page',
      },
    },
    StudentAssociation: {
      resolve: {
        queryField: 'studentAssociation',
        arguments: ({ uid }) => ({ uid }),
      },
    },
    Group: {
      resolve: {
        queryField: 'group',
        arguments: ({ uid }) => ({ uid }),
      },
    },
    PagesEdge: {
      keys: ['cursor'],
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
        if (typeof date === 'string') return date;
        return date && date.toISOString();
      },
    },
    Counts: {
      type: 'Record<string, number>',
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
    File: {
      type: 'File',
      marshal: (x) => x,
      unmarshal: () => {
        throw new Error('Cannot unmarshal File scalar');
      },
    },
    UID: {
      type: 'string',
      marshal: (x) => {
        if (!/[\w-]{3,255}/.test(x)) {
          throw new Error('Identifiant invalide');
        }
        return x;
      },
      unmarshal: (x) => x,
    },
  },
  features: {
    runtimeScalars: {
      LoggedIn: {
        type: 'Boolean',
        resolve: ({ session }) => {
          console.log({ session });
          return Boolean(session?.token);
        },
      },
    },
  },
};

export default config;
