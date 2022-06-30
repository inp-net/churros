import * as cookie from "cookie";
import { Query, type PropsType } from "./zeus.js";

/** What's needed in a user session. */
export const sessionUserQuery = () =>
  Query({
    id: true,
    name: true,
    admin: true,
    canEditClubs: true,
    canEditUsers: true,
    clubs: { clubId: true, canEditArticles: true, canEditMembers: true },
  });

export type SessionUser = PropsType<typeof sessionUserQuery, "User">;

export const saveSessionToken = (token: string) => {
  document.cookie = cookie.serialize("token", token, {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    path: "/",
  });
};
