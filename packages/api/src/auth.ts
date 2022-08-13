import { User } from '@prisma/client';
import { Context } from './context.js';

export interface AuthScopes {
  loggedIn: boolean;
  admin: boolean;
  canEditUsers: boolean;
  canEditGroups: boolean;
}

export interface AuthContexts {
  loggedIn: Context & { user: User };
}

export const authScopes = ({ user }: Context) => ({
  loggedIn: Boolean(user),
  admin: Boolean(user?.admin),
  canEditGroups: Boolean(user?.admin || user?.canEditGroups),
  canEditUsers: Boolean(user?.admin || user?.canEditUsers),
});
