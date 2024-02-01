import type { User } from '@prisma/client';
import type { Context } from './context.js';

export interface AuthScopes {
  loggedIn: boolean;
  student: boolean;
  admin: boolean;
  canEditUsers: boolean;
  canEditGroups: boolean;
  canAccessDocuments: boolean;
}

export interface AuthContexts {
  loggedIn: Context & { user: User };
  student: Context & { user: User };
}

export const authScopes = ({ user }: Context) => ({
  loggedIn: Boolean(user),
  student: Boolean(user?.majorId),
  admin: Boolean(user?.admin),
  canEditGroups: Boolean(user?.admin || user?.canEditGroups),
  canEditUsers: Boolean(user?.admin || user?.canEditUsers),
  canAccessDocuments: Boolean(user?.admin || user?.canAccessDocuments),
});

export function isThirdPartyToken(token: string): boolean {
  return token.startsWith('churros_');
}
