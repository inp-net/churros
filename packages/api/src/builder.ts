import SchemaBuilder, { type BuiltinScalarRef } from '@pothos/core';
import ComplexityPlugin from '@pothos/plugin-complexity';
import DataloaderPlugin from '@pothos/plugin-dataloader';
import ErrorsPlugin from '@pothos/plugin-errors';
import PrismaPlugin from '@pothos/plugin-prisma';
import type PrismaTypes from '@pothos/plugin-prisma/generated';
import RelayPlugin from '@pothos/plugin-relay';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects';
import TracingPlugin, { isRootField, wrapResolver } from '@pothos/plugin-tracing';
import ValidationPlugin from '@pothos/plugin-validation';
import { authScopes, type AuthContexts, type AuthScopes } from './auth.js';
import type { Context } from './context.js';
import { prisma } from './prisma.js';
import { GraphQLError, Kind } from 'graphql';

/**
 * Maps database ID prefixes to GraphQL type names. Please add new types here as they are added to
 * the schema, by running node scripts/update-id-prefix-to-typename-map.js.
 */
/* @generated from schema by file:///home/ewen/projects/centraverse/packages/api/build/scripts/update-id-prefix-to-typename-map.js */ export const ID_PREFIXES_TO_TYPENAMES =
  {
    u: 'User',
    godparentreq: 'GodparentRequest',
    candidate: 'UserCandidate',
    passreset: 'PasswordReset',
    emailchange: 'EmailChange',
    link: 'Link',
    major: 'Major',
    school: 'School',
    credential: 'Credential',
    ae: 'StudentAssociation',
    g: 'Group',
    a: 'Article',
    e: 'Event',
    tg: 'TicketGroup',
    t: 'Ticket',
    r: 'Registration',
    log: 'LogEntry',
    lydia: 'LydiaAccount',
    lydiapayment: 'LydiaTransaction',
    barweek: 'BarWeek',
    notifsub: 'NotificationSubscription',
    notif: 'Notification',
    notifsetting: 'NotificationSetting',
  };
/* end @generated from schema */

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
  ],
  authScopes,
  complexity: { limit: { complexity: 11_000, depth: 7, breadth: 100 } },
  defaultInputFieldRequiredness: true,
  errorOptions: { defaultTypes: [Error] },
  prisma: { client: prisma, exposeDescriptions: true },
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
        console.log(
          `Executed \u001B[36;1m${config.parentType}.${
            config.name
          }\u001B[0m in \u001B[36;1m${Number(duration.toPrecision(3))} ms\u001B[0m`
        );
      }),
  },
});

builder.queryType({});
builder.mutationType({});

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
