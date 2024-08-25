import type { User } from '@churros/db/prisma';
import type { Context } from './context.js';

export const OAUTH_SCOPES = ['family:write'] as const;

export type OAuthScope = (typeof OAUTH_SCOPES)[number];

export interface AuthScopes extends Record<OAuthScope, boolean> {
  loggedIn: boolean;
  student: boolean;
  admin: boolean;
  canAccessDocuments: boolean;
  studentAssociationAdmin: boolean;
}

export interface AuthContexts {
  loggedIn: Context & { user: User };
  student: Context & { user: User };
}

export function authScopes({ user, weakUser }: Context) {
  const oauthScopes = Object.fromEntries(
    OAUTH_SCOPES.map((scope) => [scope, Boolean(user || weakUser?.scopes?.includes(scope))]),
  ) as Record<OAuthScope, boolean>;

  return {
    loggedIn: Boolean(weakUser ?? user),
    student: Boolean((weakUser ?? user)?.majorId),
    admin: Boolean(user?.admin),
    studentAssociationAdmin: Boolean(user?.adminOfStudentAssociations.length),
    canAccessDocuments: Boolean(user?.admin || user?.canAccessDocuments),
    ...oauthScopes,
  };
}

// TODO
// export function permissionField<Resolver>(d: {
//   description: string,
//   resolve: Resolver,

// }) {
//   return {
//     type: 'Boolean',
//     description: d.description,
//       args: {
//         assert: t.arg.string({
//           required: false,
//           description: "Lève une erreur avec le message donné si la permission n'est pas accordée",
//         }),
//       },

//     }
// }
