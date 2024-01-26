declare namespace App {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type UserSession$result = import('$houdini');

  interface Locals {
    me?: UserSession$result['me'];
    mobile: boolean;
    token?: string;
  }

  interface Session {
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
