import * as cookie from "cookie";

export const saveSessionToken = (token: string) => {
  document.cookie = cookie.serialize("token", token, {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });
};
