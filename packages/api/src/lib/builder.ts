import type { Context, GraphinxDirective, RateLimitDirective } from '#lib';
import {
  ENV,
  authScopes,
  decodeGlobalID,
  encodeGlobalID,
  type AuthContexts,
  type AuthScopes,
} from '#lib';
import type PrismaTypes from '@churros/db/pothos';
import SchemaBuilder from '@pothos/core';
import ComplexityPlugin from '@pothos/plugin-complexity';
import DataloaderPlugin from '@pothos/plugin-dataloader';
import DirectivePlugin from '@pothos/plugin-directives';
import ErrorsPlugin from '@pothos/plugin-errors';
import PrismaPlugin from '@pothos/plugin-prisma';
import RelayPlugin from '@pothos/plugin-relay';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects';
import SmartSubscriptionsPlugin, {
  subscribeOptionsFromIterator,
} from '@pothos/plugin-smart-subscriptions';
import TracingPlugin, { isRootField, runFunction } from '@pothos/plugin-tracing';
import WithInputPlugin from '@pothos/plugin-with-input';
import ZodPlugin from '@pothos/plugin-zod';
import { createSentryWrapper } from '@pothos/tracing-sentry';
import * as Sentry from '@sentry/node';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';
import { prisma } from './prisma.js';
import { pubsub } from './pubsub.js';
import { DEFAULT_RATE_LIMITS } from './ratelimit.js';

if (ENV.SENTRY_GRAPHQL_DSN) {
  console.log(`Initializing Sentry tracing to dsn ${ENV.SENTRY_GRAPHQL_DSN}`);
  Sentry.init({
    dsn: ENV.SENTRY_GRAPHQL_DSN,
    tracesSampleRate: 1,
  });
}

const traceResolver = createSentryWrapper({
  includeArgs: true,
  includeSource: true,
});

export const CapacityUnlimitedValue = 'Unlimited' as const;
export type Capacity = number | typeof CapacityUnlimitedValue;

export interface PothosTypes {
  AuthContexts: AuthContexts;
  AuthScopes: AuthScopes;
  Context: Context;
  DefaultInputFieldRequiredness: true;
  PrismaTypes: PrismaTypes;
  DefaultFieldNullability: false;
  DefaultEdgesNullability: false;
  DefaultNodeNullability: false;
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
    File: {
      Input: never;
      Output: File;
    };
    ID: {
      Input: string;
      Output: string;
    };
    Counts: {
      Input: Record<string, number>;
      Output: Record<string, number>;
    };
    BooleanMap: {
      Input: Record<string, boolean>;
      Output: Record<string, boolean>;
    };
    UID: {
      Input: string;
      Output: string;
    };
    LocalID: {
      Input: string;
      Output: string;
    };
    Markdown: {
      Input: string;
      Output: string;
    };
    HTML: {
      Input: string;
      Output: never;
    };
    ShortString: {
      Input: string;
      Output: string;
    };
    PositiveInt: {
      Input: number;
      Output: number;
    };
    PositiveFloat: {
      Input: number;
      Output: number;
    };
    Capacity: {
      Input: Capacity;
      Output: Capacity;
    };
    URL: {
      Input: URL;
      Output: URL;
    };
    LooseURL: {
      Input: string;
      Output: string;
    };
    Email: {
      Input: string;
      Output: string;
    };
    PhoneNumber: {
      Input: string;
      Output: string;
    };
    Color: {
      Input: string;
      Output: string;
    };
  };
  Directives: {
    rateLimit: RateLimitDirective;
    graphinx: GraphinxDirective;
  };
}

export const builder = new SchemaBuilder<PothosTypes>({
  plugins: [
    ComplexityPlugin,
    DataloaderPlugin,
    ErrorsPlugin,
    PrismaPlugin,
    RelayPlugin,
    ScopeAuthPlugin,
    SimpleObjectsPlugin,
    TracingPlugin,
    ZodPlugin,
    SmartSubscriptionsPlugin,
    DirectivePlugin,
    WithInputPlugin,
  ],
  complexity: { limit: { complexity: 50_000, depth: 10, breadth: 400 } },
  defaultInputFieldRequiredness: true,
  defaultFieldNullability: false,
  withInput: {},
  errors: {
    defaultTypes: [Error, ZodError],
  },
  prisma: { client: prisma, exposeDescriptions: true },
  scopeAuth: {
    unauthorizedError: () => new GraphQLError("Tu n'es pas autorisé à effectuer cette action."),
    authScopes,
  },
  relay: {
    encodeGlobalID,
    decodeGlobalID,
    nodesOnConnection: true,
    nodeQueryOptions: false,
    nodesQueryOptions: false,
    brandLoadedObjects: true,
    edgesFieldOptions: {
      nullable: false,
    },
    nodeFieldOptions: {
      nullable: false,
    },
  },
  tracing: {
    default: (config) => isRootField(config),
    wrap: (resolver, options, config) => async (source, args, ctx, info) => {
      return runFunction(
        () => traceResolver(resolver, options)(source, args, ctx, info),
        (_error, duration) => {
          console.info(
            `Executed \u001B[36;1m${(info.operation.name?.value ?? '').padStart(20)} ${config.parentType}.${
              config.name
            }\u001B[0m in \u001B[36;1m${Number(duration.toPrecision(3))} ms\u001B[0m`,
          );
        },
      );
    },
  },
  smartSubscriptions: {
    ...subscribeOptionsFromIterator((name) => {
      console.info(`Subscribing to ${name}`);
      return pubsub.subscribe(name);
    }),
  },
});

builder.queryType({
  directives: {
    rateLimit: DEFAULT_RATE_LIMITS.Query,
  },
});

builder.mutationType({
  directives: {
    rateLimit: DEFAULT_RATE_LIMITS.Mutation,
  },
});

builder.subscriptionType({
  description: `Permet de faire des requêtes de données temps-réel, via des _websockets_.
L'endpoint pour le temps réel est \`${ENV.PUBLIC_API_WEBSOCKET_URL}\`. 

Pour un client JavaScript, il y a par exemple [GraphQL-WebSocket](https://the-guild.dev/graphql/ws/get-started#use-the-client)`,
  directives: {
    rateLimit: DEFAULT_RATE_LIMITS.Subscription,
  },
});
