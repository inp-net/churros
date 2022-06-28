/// <reference types="@sveltejs/kit" />

declare namespace App {
  type SessionUserType = import("$lib/session.js").SessionUser;

  interface Session {
    token?: string;
    me?: SessionUserType;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Locals extends Session {}

  // interface Platform {}
  // interface Stuff {}
}
