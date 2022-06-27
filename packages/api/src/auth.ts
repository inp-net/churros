import { User } from "@prisma/client";
import { Context } from "./context.js";

export type AuthScopes = {
  loggedIn: boolean;
  canPostArticles: boolean;
};

export type AuthContexts = {
  loggedIn: Context & { user: User };
};

export const authScopes = ({ user }: Context) => ({
  loggedIn: Boolean(user),
  canPostArticles: false,
});
