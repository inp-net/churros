import { mutate } from "$lib/zeus.js";
import type { RequestHandler } from "@sveltejs/kit";
import * as cookie from "cookie";

export const get: RequestHandler = async ({ url, locals }) => {
  const token = url.searchParams.get("token");
  if (token !== locals.token) return { status: 401, body: "Incorrect token" };

  try {
    await mutate({ logout: true }, { token });
  } catch {
    // Ignore errors
  }

  return {
    status: 307,
    headers: {
      Location: "/",
      "Set-Cookie": cookie.serialize("token", "", { expires: new Date(0) }),
    },
  };
};
