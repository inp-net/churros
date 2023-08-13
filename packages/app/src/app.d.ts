declare namespace App {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type SessionUserType = import('$lib/session.js').SessionUser;

  interface Locals {
    me?: SessionUserType;
    mobile: boolean;
    token?: string;
  }

  interface PageData {
    me?: SessionUserType;
    mobile: boolean;
    token?: string;
  }
}

declare module 'simple-svelte-autocomplete';

declare module 'ics-service';
