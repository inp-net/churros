declare namespace App {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type SessionUserType = import('$lib/session.js').SessionUser;

  interface Locals {
    token?: string;
    me?: SessionUserType;
    mobile: boolean;
  }

  // interface Platform {}
  // interface Stuff {}
}
