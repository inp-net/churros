import * as cookie from "cookie";
import { Selector, type InputType, type GraphQLTypes } from "./zeus.js";

/** What's needed in a user session. */
export const sessionUserQuery = Selector("User")({
  id: true,
  name: true,
  clubs: { clubId: true, canPostArticles: true, canAddMembers: true },
});

export type SessionUser = InputType<
  GraphQLTypes["User"],
  typeof sessionUserQuery
>;

export const saveSessionToken = (token: string) => {
  document.cookie = cookie.serialize("token", token, {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    path: "/",
  });
};
