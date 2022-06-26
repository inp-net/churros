import { User } from "@prisma/client";
import { Context } from "./context.js";

export type AuthScopes = Awaited<ReturnType<typeof authScopes>>;
export type AuthContexts = {
  loggedIn: Context & { user: User };
};

export const authScopes = ({ user }: Context) => ({
  loggedIn: Boolean(user),
});
