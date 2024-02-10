import type { Context } from '#lib';
import { authScopes, type AuthContexts, type AuthScopes } from '#lib';
import SchemaBuilder, { type BuiltinScalarRef } from '@pothos/core';
import ComplexityPlugin from '@pothos/plugin-complexity';
import DataloaderPlugin from '@pothos/plugin-dataloader';
import DirectivePlugin from '@pothos/plugin-directives';
import ErrorsPlugin from '@pothos/plugin-errors';
import PrismaPlugin from '@pothos/plugin-prisma';
import type PrismaTypes from '@pothos/plugin-prisma/generated';
import RelayPlugin from '@pothos/plugin-relay';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects';
import SmartSubscriptionsPlugin, {
  subscribeOptionsFromIterator,
} from '@pothos/plugin-smart-subscriptions';
import TracingPlugin, { isRootField, wrapResolver } from '@pothos/plugin-tracing';
import ValidationPlugin from '@pothos/plugin-validation';
import { GraphQLError, Kind } from 'graphql';
import { prisma } from './prisma.js';
import { pubsub } from './pubsub.js';

/**
 * Maps database ID prefixes to GraphQL type names. Please add new types here as they are added to
 * the schema, by running node scripts/update-id-prefix-to-typename-map.js.
 */
/* @generated from schema by /packages/api/scripts/update-id-prefix-to-typename-map.ts */
export const ID_PREFIXES_TO_TYPENAMES = {
  u: 'User',
  godparentreq: 'GodparentRequest',
  candidate: 'UserCandidate',
  passreset: 'PasswordReset',
  emailchange: 'EmailChange',
  service: 'Service',
  link: 'Link',
  major: 'Major',
  minor: 'Minor',
  school: 'School',
  credential: 'Credential',
  token: 'ThirdPartyCredential',
  app: 'ThirdPartyApp',
  ae: 'StudentAssociation',
  contribution: 'Contribution',
  contributionoption: 'ContributionOption',
  g: 'Group',
  a: 'Article',
  e: 'Event',
  tg: 'TicketGroup',
  t: 'Ticket',
  r: 'Registration',
  log: 'LogEntry',
  lydia: 'LydiaAccount',
  lydiapayment: 'LydiaTransaction',
  paypalpayment: 'PaypalTransaction',
  barweek: 'BarWeek',
  notifsub: 'NotificationSubscription',
  notif: 'Notification',
  ann: 'Announcement',
  ue: 'TeachingUnit',
  subj: 'Subject',
  doc: 'Document',
  comment: 'Comment',
  reac: 'Reaction',
  promocode: 'PromotionCode',
  promo: 'Promotion',
} as const;
/* end @generated from schema */

export const TYPENAMES_TO_ID_PREFIXES = Object.fromEntries(
  Object.entries(ID_PREFIXES_TO_TYPENAMES).map(([prefix, typename]) => [typename, prefix]),
) as Record<
  (typeof ID_PREFIXES_TO_TYPENAMES)[keyof typeof ID_PREFIXES_TO_TYPENAMES],
  keyof typeof ID_PREFIXES_TO_TYPENAMES
>;

export function removeIdPrefix(id: string): string {
  if (id.split(':').length !== 2) throw new Error(`Cannot remove id prefix from ${id}`);
  const [prefix, rest] = id.split(':') as [string, string];
  if (!(prefix in ID_PREFIXES_TO_TYPENAMES)) throw new Error(`Unknown prefix: ${prefix}`);
  return rest;
}

export function ensureHasIdPrefix(id: string, typename: keyof typeof TYPENAMES_TO_ID_PREFIXES) {
  if (id.split(':').length === 2) return id;
  if (!(typename in TYPENAMES_TO_ID_PREFIXES)) throw new Error(`Unknown typename: ${typename}`);
  return `${TYPENAMES_TO_ID_PREFIXES[typename]}:${id}`;
}

/**
 * Split a global ID into its typename and local ID parts.
 * @param id The global ID to split
 */
export function splitID(id: string): [keyof typeof TYPENAMES_TO_ID_PREFIXES, string] {
  if (id.split(':').length !== 2) throw new Error(`Malformed ID ${id}`);
  const [prefix, rest] = id.split(':') as [string, string];
  if (!(prefix in ID_PREFIXES_TO_TYPENAMES)) throw new Error(`Unknown prefix: ${prefix}`);
  return [ID_PREFIXES_TO_TYPENAMES[prefix as keyof typeof ID_PREFIXES_TO_TYPENAMES], rest];
}

export const builder = new SchemaBuilder<{
  AuthContexts: AuthContexts;
  AuthScopes: AuthScopes;
  Context: Context;
  DefaultInputFieldRequiredness: true;
  PrismaTypes: PrismaTypes;
  Scalars: {
    DateTime: { Input: Date; Output: Date };
    File: { Input: never; Output: File };
    ID: { Input: string; Output: string };
    Counts: { Input: Record<string, number>; Output: Record<string, number> };
    BooleanMap: { Input: Record<string, boolean>; Output: Record<string, boolean> };
  };
  Directives: {
    rateLimit: {
      locations: 'OBJECT' | 'FIELD_DEFINITION';
      args: { limit: number; duration: number };
    };
  };
}>({
  plugins: [
    ComplexityPlugin,
    DataloaderPlugin,
    ErrorsPlugin,
    PrismaPlugin,
    RelayPlugin,
    ScopeAuthPlugin,
    SimpleObjectsPlugin,
    TracingPlugin,
    ValidationPlugin,
    SmartSubscriptionsPlugin,
    DirectivePlugin,
  ],
  authScopes,
  complexity: { limit: { complexity: 30_000, depth: 7, breadth: 200 } },
  defaultInputFieldRequiredness: true,
  errorOptions: { defaultTypes: [Error] },
  prisma: { client: prisma, exposeDescriptions: true },
  scopeAuthOptions: {
    unauthorizedError: () => new GraphQLError("Tu n'es pas autorisé à effectuer cette action."),
  },
  relayOptions: {
    clientMutationId: 'omit',
    cursorType: 'String',
    encodeGlobalID: (_typename, id, {}) => id.toString(),
    decodeGlobalID(globalID, {}) {
      const [typename, id] = globalID.split(':');
      if (!typename || !id) throw new Error(`Invalid global ID: ${globalID}`);
      if (!(typename in ID_PREFIXES_TO_TYPENAMES)) throw new Error(`Unknown typename: ${typename}`);
      return {
        typename: ID_PREFIXES_TO_TYPENAMES[typename as keyof typeof ID_PREFIXES_TO_TYPENAMES],
        id: globalID,
      };
    },
  },
  tracing: {
    default: (config) => isRootField(config),
    wrap: (resolver, _options, config) =>
      wrapResolver(resolver, (_error, duration) => {
        console.info(
          `Executed \u001B[36;1m${config.parentType}.${
            config.name
          }\u001B[0m in \u001B[36;1m${Number(duration.toPrecision(3))} ms\u001B[0m`,
        );
      }),
  },
  smartSubscriptions: {
    ...subscribeOptionsFromIterator((name) => {
      console.info(`Subscribing to ${name}`);
      return pubsub.subscribe(name);
    }),
  },
});

// The frontend can sometimes make bursts of requests, so we add a grace window to the rate limits to prevent failures. Real attacks attempt DDOS for longer than this grace window, so it should be safe.
const rateLimitGraceWindow = 30; /* seconds */
const rateLimit = (limit: number, duration: number) => ({
  rateLimit: { limit: limit * rateLimitGraceWindow, duration: duration * rateLimitGraceWindow },
});

builder.queryType({
  directives: {
    ...rateLimit(3, 1),
  },
});

builder.mutationType({
  directives: {
    ...rateLimit(5, 10),
  },
});

builder.subscriptionType({
  directives: {
    ...rateLimit(10, 30),
  },
});

// Parse GraphQL IDs as strings
const id = (builder.configStore.getInputTypeRef('ID') as BuiltinScalarRef<string, string>).type;

id.parseValue = (value: unknown) => {
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') return value;
  throw new GraphQLError('Expected ID to be a number or a string.');
};

id.parseLiteral = (node) => {
  if (node.kind !== Kind.INT && node.kind !== Kind.STRING)
    throw new GraphQLError('Expected ID to be a numeric.');
  return id.parseValue(node.value);
};
