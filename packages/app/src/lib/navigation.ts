import { browser } from '$app/environment';
import { goto, pushState } from '$app/navigation';
import { page } from '$app/stores';
import { cache, graphql, LogoutStore } from '$houdini';
import { currentPageIsPinned, pinCurrentPage, unpinCurrentPage } from '$lib/pins';
import { route } from '$lib/ROUTES';
import type { Page } from '@sveltejs/kit';
import { get } from 'svelte/store';
import IconAddFilled from '~icons/msl/add-circle';
import IconAdd from '~icons/msl/add-circle-outline';
import IconPin from '~icons/msl/bookmark-outline';
import IconPinRemove from '~icons/msl/bookmark-remove';
import IconAnnouncement from '~icons/msl/campaign-outline';
import IconXML from '~icons/msl/code';
import IconTrashFilled from '~icons/msl/delete';
import IconTrash from '~icons/msl/delete-outline';
import IconDownload from '~icons/msl/download';
import IconPen from '~icons/msl/edit-outline';
import IconDonate from '~icons/msl/euro';
import IconEvent from '~icons/msl/event-outline';
import IconGift from '~icons/msl/featured-seasonal-and-gifts-rounded';
import IconGroup from '~icons/msl/group-outline';
import IconInformation from '~icons/msl/info-outline';
import IconForm from '~icons/msl/list-alt-outline';
import IconLogout from '~icons/msl/logout';
import IconNotificationSettings from '~icons/msl/notifications-outline';
import IconPostAdd from '~icons/msl/post-add';
import IconScanQR from '~icons/msl/qr-code-scanner';
import IconCog from '~icons/msl/settings-outline';
import IconShield from '~icons/msl/shield-outline';
import IconPost from '~icons/msl/text-ad-outline';
import IconBookingsList from '~icons/msl/view-list-outline';
import IconWallet from '~icons/msl/wallet';
import type { LayoutParams, LayoutRouteId } from '../routes/$types';
import type {
  NavigationContext,
  NavigationQuickAction,
} from '../routes/(app)/NavigationTop.svelte';

export function addReferrer(url: URL | string, referrer?: URL | string): string;
export function addReferrer(
  url: URL | string | undefined,
  referrer?: URL | string,
): string | undefined;
export function addReferrer(
  url: URL | string | undefined,
  referrer?: URL | string,
): string | undefined {
  if (!url) return undefined;
  const u = new URL(url, typeof url === 'string' ? get(page).url : undefined);
  u.searchParams.set('from', referrer?.toString() ?? get(page).url.pathname.toString());
  u.host = '';
  u.protocol = '';
  return u.toString();
}

/**
 * Just like route(...), but tacks on a ?from query param to the current pathname
 */
// @ts-expect-error can't be bothered to type that shit
export const refroute: typeof route = (...args) => addReferrer(route(...args));

export type NavigationTopActionEvent =
  `NAVTOP_${'COPY_ID' | 'PIN_PAGE' | 'GOTO_EVENT_FROM_BOOKING' | 'FINISH_EDITING' | 'CREATE_EVENT'}`;
const navigationTopActionEventDispatcher = (eventID: NavigationTopActionEvent) => {
  window.dispatchEvent(new CustomEvent(eventID));
};

export type NavigationTopStateKeys =
  `NAVTOP_${'NOTIFICATION_SETTINGS' | 'PINNING' | 'DELETING' | 'GO_TO_EVENT_DAY' | `CREATING_${'EVENT' | 'POST' | 'GROUP'}`}`;

export type NavigationTopState = Partial<Record<NavigationTopStateKeys, boolean>>;

function navtopPushState(key: NavigationTopStateKeys) {
  pushState('', {
    [key]: true,
  } satisfies NavigationTopState);
}

async function navtopPermissions() {
  const { me } = await graphql(`
    query NavigationTopPermissions @cache(policy: CacheOrNetwork) {
      me {
        admin
        studentAssociationAdmin
        canCreatePostsOn {
          id
        }
        canCreateGroupsOn {
          id
        }
        canCreateEventsOn {
          id
        }
        canManageAnnouncements
      }
    }
  `)
    .fetch()
    .then((r) => r.data ?? { me: null });
  return me;
}

const commonActions = {
  pin: async (page: Page) => {
    const pinned = await currentPageIsPinned(page);
    return {
      label: pinned ? "Retirer de l'accès rapide" : 'Accès rapide',
      icon: pinned ? IconPinRemove : IconPin,
      async do() {
        if (pinned) await unpinCurrentPage(page);
        else pinCurrentPage(page);
      },
    };
  },
  delete: {
    label: 'Supprimer',
    icon: IconTrash,
    filledIcon: IconTrashFilled,
    do() {
      navtopPushState('NAVTOP_DELETING');
    },
  },
  edit: {
    label: 'Modifier',
    icon: IconPen,
  },
  settings: {
    label: 'Paramètres',
    icon: IconCog,
  },
  copyID: {
    label: "Copier l'ID",
    icon: IconXML,
    do() {
      navigationTopActionEventDispatcher('NAVTOP_COPY_ID');
    },
  },
} as const;

const quickActionConfigureNotations = {
  icon: IconNotificationSettings,
  do() {
    navtopPushState('NAVTOP_NOTIFICATION_SETTINGS');
  },
};

const quickActionAdd = {
  icon: IconAdd,
  filledIcon: IconAddFilled,
  // mobileOnly: true,
  overflow: [
    async () => {
      const me = browser ? await navtopPermissions() : null;
      return {
        icon: IconPost,
        label: 'Post',
        href: route('/posts/create'),
        disabled: !me?.admin && !me?.canCreatePostsOn.length,
      };
    },
    async () => {
      const me = browser ? await navtopPermissions() : null;
      return {
        icon: IconEvent,
        label: 'Évènement',
        do: () => navtopPushState('NAVTOP_CREATING_EVENT'),
        disabled: !me?.admin && !me?.canCreateEventsOn.length,
      };
    },
    {
      icon: IconForm,
      label: 'Formulaire',
      href: route('/forms/create'),
    },
    async () => {
      const me = browser ? await navtopPermissions() : null;
      return {
        icon: IconGroup,
        label: 'Groupe',
        do: () => alert('TODO'),
        disabled: !me?.admin && !me?.canCreateGroupsOn.length,
      };
    },
    async () => {
      const me = browser ? await navtopPermissions() : null;
      return {
        icon: IconAnnouncement,
        label: 'Annonce',
        href: route('/announcements/create'),
        disabled: !me?.canManageAnnouncements,
      };
    },
  ],
} satisfies NavigationQuickAction;

const rootPagesActions = [
  {
    icon: IconGift,
    label: 'Nouveautés',
    href: route('/changelog'),
  },
  {
    icon: IconInformation,
    label: 'À propos',
    href: route('/credits'),
  },
  {
    icon: IconXML,
    label: 'Developers',
    href: route('GET /developers'),
  },
  async () => {
    const me = browser ? await navtopPermissions() : null;
    return {
      icon: IconShield,
      label: 'Zone admins',
      href: '/backrooms',
      hidden: !me?.admin && !me?.studentAssociationAdmin,
    };
  },
  {
    icon: IconLogout,
    label: 'Se déconnecter',
    async do() {
      new LogoutStore().mutate(null);
      cache.reset();
      await goto(route('/'));
    },
  },
] as Array<NavigationContext['actions'][number]>;

export const topnavConfigs: Partial<{
  [RouteID in NonNullable<LayoutRouteId>]:
    | NavigationContext
    | ((
        // TODO Figure out a way to get PageParams of RouteID? The PageParams exported on  (app)/layout's $type is empty...
        page: Page<{ [K in keyof LayoutParams]-?: NonNullable<LayoutParams[K]> }, RouteID>,
      ) => NavigationContext);
}> = {
  '/(app)': {
    quickAction: quickActionAdd,
    actions: rootPagesActions,
  },
  '/(app)/search/[[q]]': {
    quickAction: quickActionAdd,
    actions: rootPagesActions,
  },
  '/(app)/services': {
    quickAction: quickActionAdd,
    actions: [
      {
        icon: IconPin,
        label: 'Épingler…',
        do() {
          navtopPushState('NAVTOP_PINNING');
        },
      },
      {
        icon: IconPen,
        label: 'Modifier…',
        href: route('/backrooms/services'),
      },
      ...rootPagesActions,
    ],
  },
  '/(app)/posts/[id]': ({ params: { id } }) => ({
    actions: [
      commonActions.delete,
      { ...commonActions.edit, href: route('/posts/[id]/edit', id) },
      commonActions.pin,
    ],
    title: 'Post',
  }),
  '/(app)/groups/[uid]': ({ params: { uid } }) => ({
    quickAction: quickActionConfigureNotations,
    actions: [
      { ...commonActions.settings, href: route('/groups/[uid]/edit', uid) },
      commonActions.pin,
      commonActions.copyID,
    ],
    title: uid,
  }),
  '/(app)/users/[uid]': ({ params: { uid } }) => ({
    actions: [
      { ...commonActions.edit, href: route('/users/[uid]/edit', uid) },
      commonActions.pin,
      commonActions.copyID,
    ],
    title: uid,
  }),
  '/(app)/student-associations/[uid]': ({ params: { uid } }) => ({
    title: uid,
    quickAction: quickActionConfigureNotations,
    actions: [
      { ...commonActions.settings, do: () => alert('TODO') },
      {
        icon: IconDonate,
        label: 'Cotiser',
        do: () => alert('TODO'),
      },
      commonActions.pin,
      commonActions.copyID,
    ],
  }),
  '/(app)/events/[[week=date]]': {
    quickAction: {
      icon: IconWallet,
      href: route('/bookings'),
    },
    actions: [
      {
        icon: IconEvent,
        label: 'Aller à…',
        do: () => navtopPushState('NAVTOP_GO_TO_EVENT_DAY'),
      },
      ...rootPagesActions,
    ],
  },
  '/(app)/events/[id]': ({ params: { id } }) => ({
    title: 'Évènement',
    quickAction: {
      icon: IconScanQR,
      href: route('/events/[id]/scan', id),
    },
    back: route('/events'),
    actions: [
      { ...commonActions.edit, href: route('/events/[id]/edit', id) },
      {
        icon: IconBookingsList,
        label: 'Réservations',
        href: route('/events/[id]/bookings', id),
      },
      {
        icon: IconPostAdd,
        label: 'Post lié',
        href: route('/events/[id]/write', id),
      },
      commonActions.pin,
      commonActions.copyID,
    ],
  }),

  '/(app)/events/[id]/edit': ({ params: { id } }) => ({
    title: 'Modifier l’évènement',
    back: route('/events/[id]', id),
    actions: [commonActions.delete],
  }),
  '/(app)/events/[id]/edit/visibility': ({ params: { id } }) => ({
    title: 'Visibilité',
    back: route('/events/[id]/edit', id),
    actions: [commonActions.delete],
  }),
  '/(app)/events/[id]/edit/links': ({ params: { id } }) => ({
    title: 'Liens',
    back: route('/events/[id]/edit', id),
    actions: [commonActions.delete],
  }),
  '/(app)/events/[id]/edit/description': ({ params: { id } }) => ({
    title: 'Description',
    back: route('/events/[id]/edit', id),
    actions: [commonActions.delete],
  }),
  '/(app)/events/[id]/edit/image': ({ params: { id } }) => ({
    title: 'Image',
    back: route('/events/[id]/edit', id),
    actions: [commonActions.delete],
  }),
  '/(app)/events/[id]/edit/recurrence': ({ params: { id } }) => ({
    title: 'Récurrence',
    back: route('/events/[id]/edit', id),
    actions: [commonActions.delete],
  }),
  '/(app)/events/[id]/edit/contact': ({ params: { id } }) => ({
    title: "Contact de l'orga",
    back: route('/events/[id]/edit', id),
    actions: [commonActions.delete],
  }),
  '/(app)/events/[id]/edit/managers': ({ params: { id } }) => ({
    title: 'Managers',
    back: route('/events/[id]/edit', id),
    actions: [commonActions.delete],
  }),
  '/(app)/events/[id]/edit/banned': ({ params: { id } }) => ({
    title: 'Banni·e·s',
    back: route('/events/[id]/edit', id),
    actions: [commonActions.delete],
  }),
  '/(app)/events/[id]/edit/tickets': ({ params: { id } }) => ({
    title: 'Billetterie',
    back: route('/events/[id]/edit', id),
    actions: [],
  }),
  '/(app)/events/[id]/edit/tickets/[ticket]': ({ params }) => ({
    title: 'Billet',
    back: route('/events/[id]/edit/tickets', params.id),
    actions: [commonActions.delete],
  }),
  '/(app)/events/[id]/edit/tickets/[ticket]/links': ({ params }) => ({
    title: 'Liens du billet',
    back: route('/events/[id]/edit/tickets/[ticket]', params),
    actions: [],
  }),
  '/(app)/events/[id]/edit/tickets/[ticket]/payment': ({ params }) => ({
    title: 'Moyens de paiement',
    back: route('/events/[id]/edit/tickets/[ticket]', params),
    actions: [],
  }),
  '/(app)/events/[id]/bookings': ({ params: { id } }) => ({
    title: 'Réservations',
    back: route('/events/[id]', id),
    quickAction: {
      icon: IconScanQR,
      href: route('/events/[id]/scan', id),
    },
    actions: [
      { ...commonActions.edit, href: route('/events/[id]/edit', id) },
      {
        icon: IconDownload,
        label: 'Excel',
        href: route('GET /events/[id]/bookings.csv', id),
      },
      commonActions.pin,
    ],
  }),
  '/(app)/bookings/[code]/[[step]]': ({ params: { code } }) => ({
    title: 'Billet',
    back: route('/bookings'),
    actions: [
      {
        icon: IconEvent,
        label: "Aller à l'évènement",
        do() {
          navigationTopActionEventDispatcher('NAVTOP_GOTO_EVENT_FROM_BOOKING');
        },
      },
      {
        icon: IconDownload,
        label: 'Télécharger en PDF',
        href: route('GET /bookings/[code].pdf', code),
      },
    ],
  }),
  '/(app)/bookings': {
    title: 'Mes billets',
    back: route('/events'),
    actions: rootPagesActions,
  },
};

export const scanningEventsRouteID: LayoutRouteId = '/(app)/events/[id]/scan';

/**
 * Like refroute("/login"), but also adds a &why=unauthorized query param to explain why the user is being redirected to the login page.
 * @param explain {boolean} - Adds &why=unauthorized to the query string.
 */
export function loginRedirection({ explain = true } = {}) {
  return refroute('/login') + (explain ? '?why=unauthorized' : '');
}
