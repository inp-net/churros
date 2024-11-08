/** @type {import("houdini").ConfigFile} */
const config = {
  schemaPath: 'schema.graphql',
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
    GroupMember: {
      keys: ['userUid', 'groupUid'],
      resolve: {
        queryField: 'groupMember',
        arguments: ({ userUid, groupUid }) => ({ user: userUid, group: groupUid }),
      },
    },
    PagesEdge: {
      keys: ['cursor'],
    },
    EventManager: {
      keys: ['id'],
      resolve: {
        queryField: 'eventManager',
      },
    },
    EventManagerInvite: {
      keys: ['id'],
      resolve: {
        queryField: 'eventManagerInvite',
        arguments: ({ id }) => ({ idOrCode: id }),
      },
    },
    Ticket: {
      keys: ['id'],
      resolve: {
        queryField: 'ticket',
      },
    },
    TicketGroup: {
      keys: ['id'],
      resolve: {
        queryField: 'ticketGroup',
      },
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
        try {
          return date && date.toISOString();
        } catch {
          return null;
        }
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
      marshal: (x) => x,
      unmarshal: (x) => x,
    },
    LocalID: {
      type: 'string',
      marshal: (x) => {
        // Same reasoning as for UID
        if (!x) return x;
        if (!/(\w+:)?\w+/.test(x)) {
          throw new Error(`Identifiant “${x}” invalide`);
        }
        return x;
      },
    },
    Markdown: {
      type: 'string',
    },
    Color: {
      type: 'string',
    },
    PhoneNumber: {
      type: 'string',
    },
    Email: {
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
      type: 'number | App.CapacityUnlimitedValue',
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
    runtimeScalars: {},
    imperativeCache: true,
  },
};

export default config;
