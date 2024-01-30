import type { User } from '@prisma/client';
import { nanoid } from 'nanoid';
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

export function onBoard(
  permissions:
    | { president: boolean; treasurer: boolean; vicePresident: boolean; secretary: boolean }
    | undefined
    | null,
): boolean {
  if (!permissions) return false;
  return (
    permissions.president ||
    permissions.treasurer ||
    permissions.vicePresident ||
    permissions.secretary
  );
}

export function isThirdPartyToken(token: string): boolean {
  return token.startsWith('churros_');
}

export function generateThirdPartyToken(): string {
  return `churros_${nanoid()}`;
}