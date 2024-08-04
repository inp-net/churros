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
        // Allow empty UID scalars: some GraphQL documents might accept UID scalars that are non-nullable to satisfy typing requirements
        // but can actually be empty sometimes (in which case the query is skipped with a @include of another variable)
        // We can't unfortunately do sth like `field(...: $a (of type T!)) @include(if: $a (of type T)) {... $a is now of type T!...}
        // See https://github.com/graphql/graphql-spec/issues/275
        if (!x) return '';
        if (!/[\w-]{3,255}/.test(x)) {
          throw new Error(`Identifiant “${x}” invalide`);
        }
        return x;
      },
      unmarshal: (x) => x,
    },
    LocalID: {
      type: 'string',
      marshal: (x) => {
        // Same reasoning as for UID
        if (!x) return '';
        if (!/(\w+:)?\w+/.test(x)) {
          throw new Error(`Identifiant “${x}” invalide`);
        }
        return x;
      },
    },
    Markdown: {
      type: 'string',
    },
    HTML: {
      type: 'App.XSSSafeHTMLString',
    },
    ShortString: {
      type: 'string',
    },
    PositiveInt: {
      type: 'number',
    },
    PositiveFloat: {
      type: 'number',
    },
    Capacity: {
      type: 'number | null',
      marshal: (x) => (x === null ? 'Unlimited' : x),
      unmarshal: (x) => (x === 'Unlimited' ? null : x),
    },
    URL: {
      type: 'URL | null',
      marshal: (x) => x.toString(),
      unmarshal: (x) => (URL.canParse(x) ? new URL(x) : null),
    },
    LooseURL: {
      type: 'string',
      marshal: (x) => x,
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
