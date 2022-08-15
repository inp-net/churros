declare namespace App {
  type SessionUserType = import('$lib/session.js').SessionUser;

  interface Session {
    token?: string;
    me?: SessionUserType;
    mobile: boolean;
  }

  interface Locals extends Session {}

  // interface Platform {}
  // interface Stuff {}
}
