declare namespace App {
  type SessionUserType = import('$lib/session.js').SessionUser;

  interface Locals {
    token?: string;
    me?: SessionUserType;
    mobile: boolean;
  }

  // interface Platform {}
  // interface Stuff {}
}
