/// <reference types="@sveltejs/kit" />

declare namespace App {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Locals extends Session {}
  // interface Platform {}
  interface Session {
    token?: string;
    me?: { id: string; name: string };
  }
  // interface Stuff {}
}
