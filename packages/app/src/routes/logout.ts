import type { RequestHandler } from "@sveltejs/kit";
import * as cookie from "cookie";

export const get: RequestHandler = ({ url, locals }) => {
  const token = url.searchParams.get("token");
  if (token !== locals.token) return { status: 401, body: "Incorrect token" };
  return {
    status: 307,
    headers: {
      Location: "/",
      "Set-Cookie": cookie.serialize("token", "", { expires: new Date(0) }),
    },
  };
};
