import { Context } from "./context.js";

export type AuthScopes = Awaited<ReturnType<typeof authScopes>>;

export const authScopes = ({ user }: Context) => ({
  loggedIn: Boolean(user),
});
