import { User } from "@prisma/client";
import { Context } from "./context.js";

export type AuthScopes = {
  loggedIn: boolean;
  admin: boolean;
  canEditUsers: boolean;
  canEditClubs: boolean;
};

export type AuthContexts = {
  loggedIn: Context & { user: User };
};

export const authScopes = ({ user }: Context) => ({
  loggedIn: Boolean(user),
  admin: Boolean(user?.admin),
  canEditClubs: Boolean(user?.admin || user?.canEditClubs),
  canEditUsers: Boolean(user?.admin || user?.canEditUsers),
});
