import type { User } from '@churros/db/prisma';
import { nanoid } from 'nanoid';
import type { Context } from './context.js';

export interface AuthScopes {
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

export const authScopes = ({ user }: Context) => ({
  loggedIn: Boolean(user),
  student: Boolean(user?.majorId),
  admin: Boolean(user?.admin),
  studentAssociationAdmin: Boolean(user?.adminOfStudentAssociations.length),
  canAccessDocuments: Boolean(user?.admin || user?.canAccessDocuments),
});

export function isThirdPartyToken(token: string): boolean {
  return token.startsWith('churros_');
}

export function generateThirdPartyToken(): string {
  return `churros_${nanoid()}`;
}
