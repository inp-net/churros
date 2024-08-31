type NavigationTopState = import('$lib/navigation').NavigationTopState;
type NavigationTopEventsKey = import('$lib/navigation').NavigationTopActionEvent;

declare namespace App {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type SessionUserType = import('$lib/session.js').SessionUser;
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type XSSSafeHTMLString = import('ts-opaque').Opaque<string, 'XSSSafeHTMLString'>;

  interface Locals {
    mobile: boolean;
  }

  interface Metadata {
    queryTimestamps: {
      global: number;
      network: number;
    };
  }

  interface PageData {}

  interface Session {
    token?: string;
  }

  interface PageState extends NavigationTopState {
    currentTab?: string;
    bookingTicketId?: string | null;
  }
}

declare interface ViewTransition {
  updateCallbackDone: Promise<void>;
  ready: Promise<void>;
  finished: Promise<void>;
  skipTransition: () => void;
}

declare interface Document {
  startViewTransition(updateCallback: () => Promise<void>): ViewTransition;
}

declare module 'simple-svelte-autocomplete';

declare module 'ics-service';

declare module 'arborist' {
  function createForest<
    T extends { [P in V]: U } & { [P in W]?: U | undefined | null },
    U extends PropertyKey = PropertyKey,
    V extends PropertyKey = 'id',
    W extends PropertyKey = 'parentId',
  >(list: T[], keys: { idKey?: V; parentIdKey?: W }): Array<Tree<T>>;
}

declare namespace svelteHTML {
  interface HTMLAttributes<T> {
    'on:pan'?: (event: CustomEvent<{ x: number; y: number; target: EventTarget & T }>) => void;
    'on:panup'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:pandown'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:panmove'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:pinch'?: (event: CustomEvent<{ scale: number; center: { x: number; y: number } }>) => void;
    'on:pinchup'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:pinchdown'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:pinchmove'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:rotate'?: (
      event: CustomEvent<{ rotation: number; center: { x: number; y: number } }>,
    ) => void;
    'on:rotateup'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:rotatedown'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:rotatemove'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:swipe'?: (
      event: CustomEvent<{
        direction: 'top' | 'right' | 'bottom' | 'left';
        target: EventTarget;
      }>,
    ) => void;
    'on:swipeup'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:swipedown'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:swipemove'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:tap'?: (event: CustomEvent<{ x: number; y: number; target: EventTarget }>) => void;
    'on:tapup'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:tapdown'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:tapmove'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:press'?: (event: CustomEvent<{ x: number; y: number; target: EventTarget }>) => void;
    'on:pressup'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:pressdown'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    'on:pressmove'?: (event: CustomEvent<{ event: PointerEvent; pointersCount: number }>) => void;
    // FIXME does not work
    // [K: `on:${NavigationTopEventsKey}`]: (event: CustomEvent<{}>) => Promise<void> | void;
    'on:NAVTOP_UPDATE_TITLE'?: (event: CustomEvent<string>) => Promise<void> | void;
    'on:NAVTOP_GOTO_EVENT_FROM_BOOKING'?: (event: CustomEvent<{}>) => Promise<void> | void;
    'on:NAVTOP_COPY_ID'?: (event: CustomEvent<{}>) => Promise<void> | void;
    'on:NAVTOP_REPORT_ISSUE'?: (event: CustomEvent<{}>) => Promise<void> | void;
    'on:NAVTOP_CREATE_POST_ON_EVENT'?: (event: CustomEvent<{}>) => Promise<void> | void;
  }
}

declare interface Window {
  umami: {
    track:
      | (() => void)
      | ((
          payloadOrEventOrCallback:
            | string
            | Record<string, unknown>
            | ((defaultPayload: {
                hostname: string;
                language: string;
                referrer: string;
                screen: string;
                title: string;
                url: string;
                width: number;
              }) => void),
        ) => void)
      | ((event: string, payload?: Record<string, unknown>) => void);
  };
}
