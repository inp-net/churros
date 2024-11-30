import { browser } from '$app/environment';
import { goto, pushState } from '$app/navigation';
import { page } from '$app/stores';
import { graphql } from '$houdini';
import type {
  NavigationContext,
  NavigationQuickAction,
} from '$lib/components/NavigationTop.svelte';
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
import IconEvent from '~icons/msl/event-outline';
import IconGift from '~icons/msl/featured-seasonal-and-gifts-rounded';
import IconGroup from '~icons/msl/group-outline';
import IconInformation from '~icons/msl/info-outline';
import IconAddBulk from '~icons/msl/library-add-outline';
import IconLogout from '~icons/msl/logout';
import {
  default as IconNotifications,
  default as IconNotificationSettings,
} from '~icons/msl/notifications-outline';
import IconPostAdd from '~icons/msl/post-add';
import IconScanQR from '~icons/msl/qr-code-scanner';
import IconCog from '~icons/msl/settings-outline';
import IconShield from '~icons/msl/shield-outline';
import IconPost from '~icons/msl/text-ad-outline';
import IconBookingsList from '~icons/msl/view-list-outline';
import IconWallet from '~icons/msl/wallet';
import type { LayoutParams, LayoutRouteId } from '../routes/$types';

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
  `NAVTOP_${'COPY_ID' | 'PIN_PAGE' | 'GOTO_EVENT_FROM_BOOKING' | 'FINISH_EDITING' | 'CREATE_EVENT' | 'CREATE_POST_ON_EVENT' | 'DOWNLOAD_CSV'}`;
const navigationTopActionEventDispatcher = (eventID: NavigationTopActionEvent) => {
  globalThis.dispatchEvent(new CustomEvent(eventID));
};

export type ModalStateKeys = `EDITING_GROUP_MEMBER`;

export type NavigationTopStateKeys =
  `NAVTOP_${'NOTIFICATION_SETTINGS' | 'PINNING' | 'DELETING' | 'GO_TO_EVENT_DAY' | `CREATING_${'EVENT' | 'GROUP' | 'SERVICE' | 'POST' | 'GROUP_MEMBER'}`}`;

export type NavigationTopState = Partial<Record<NavigationTopStateKeys, boolean>>;

export type ModalState = {
  EDITING_GROUP_MEMBER?: string;
};

function navtopPushState(key: NavigationTopStateKeys | ModalStateKeys) {
  pushState('', {
    [key]: true,
  } satisfies NavigationTopState & ModalState);
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

async function profileKind(uid: string) {
  const { profile } = await graphql(`
    query NavigationTopProfileType($uid: UID!) @cache(policy: CacheOrNetwork) {
      profile(uid: $uid) {
        __typename
      }
    }
  `)
    .fetch({ variables: { uid } })
    .then((r) => r.data ?? { profile: { __typename: null } });
  return profile.__typename;
}

async function isMe(uid: string) {
  const { me } = await graphql(`
    query NavigationTopIsMe @cache(policy: CacheOrNetwork) {
      me {
        uid
      }
    }
  `)
    .fetch()
    .then((r) => r.data ?? { me: null });
  return me?.uid === uid;
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

const quickActionConfigureNotfications: NavigationQuickAction = {
  icon: IconNotificationSettings,
  disabled: true, //TODO reenable once we implement notificaiton configuration
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
        do: () => navtopPushState('NAVTOP_CREATING_POST'),
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
    // TODO
    // {
    //   icon: IconForm,
    //   label: 'Formulaire',
    //   href: route('/forms/create'),
    // },
    async () => {
      const me = browser ? await navtopPermissions() : null;
      return {
        icon: IconGroup,
        label: 'Groupe',
        do: () => navtopPushState('NAVTOP_CREATING_GROUP'),
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
  async () => {
    const me = browser ? await navtopPermissions() : null;
    return {
      icon: IconNotifications,
      label: 'Notifications',
      href: route('/notifications'),
      hidden: !me,
    };
  },
  async () => {
    const me = browser ? await navtopPermissions() : null;
    return {
      icon: IconCog,
      label: 'Paramètres',
      href: route('/settings'),
      hidden: !me,
    };
  },
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
  async () => {
    const me = browser ? await navtopPermissions() : null;
    return {
      icon: IconShield,
      label: 'Zone admins',
      href: '/backrooms',
      hidden: !me?.admin && !me?.studentAssociationAdmin,
    };
  },
  async () => {
    const me = browser ? await navtopPermissions() : null;
    return {
      icon: IconLogout,
      label: 'Se déconnecter',
      async do() {
        await goto(route('/logout'));
      },
      hidden: !me,
    };
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
  '/(app)/[uid=uid]': ({ params: { uid } }) => {
    return {
      back: route('/'),
      title: uid,
      quickAction: quickActionConfigureNotfications,
      actions: [
        commonActions.pin,
        async ({ params: { uid } }) => {
          const isme = await isMe(uid);
          return {
            label: 'Réglages',
            icon: IconCog,
            href: refroute('/settings'),
            hidden: !isme,
          };
        },
        async ({ params: { uid } }) => {
          const typename = await profileKind(uid);
          return {
            icon: IconPen,
            label: 'Gérer',
            href:
              typename === 'User'
                ? route('/users/[uid]/edit', uid)
                : route('/groups/[uid]/edit', uid),
            hidden: !typename || !['User', 'Group'].includes(typename),
          };
        },
        commonActions.copyID,
      ],
    };
  },
  '/(app)/search/[[q]]': {
    quickAction: quickActionAdd,
    actions: rootPagesActions,
  },
  '/(app)/claim-code/[code]': {
    title: `Réclamation d'un code`,
    back: route('/claim-code'),
    actions: [],
  },
  '/(app)/settings': {
    title: 'Réglages',
    back: route('/'),
    actions: [],
  },
  '/(app)/settings/theme': {
    title: 'Thème',
    back: route('/settings'),
    actions: [],
  },
  '/(app)/notifications': {
    title: 'Notifications',
    back: route('/'),
    actions: [],
  },
  '/(app)/birthdays': {
    title: 'Anniversaires',
    actions: [],
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
        label: 'Gérer…',
        href: route('/services/manage'),
      },
      ...rootPagesActions,
    ],
  },
  '/(app)/services/manage': () => ({
    title: 'Gérer les services',
    back: route('/services'),
    quickAction: {
      icon: IconAdd,
      label: 'Nouveau service',
      do() {
        navtopPushState('NAVTOP_CREATING_SERVICE');
      },
    },
    actions: [],
  }),
  '/(app)/services/[id]/edit': () => ({
    title: 'Modifier un service',
    back: route('/services/manage'),
    actions: [
      {
        ...commonActions.delete,
      },
    ],
  }),
  '/(app)/posts/[id]': ({ params: { id } }) => ({
    actions: [
      commonActions.delete,
      { ...commonActions.edit, href: route('/posts/[id]/edit/body', id) },
      commonActions.pin,
    ],
    title: 'Post',
    back: route('/'),
  }),
  '/(app)/posts/[id]/edit/body': ({ params: { id } }) => ({
    actions: [commonActions.delete, commonActions.pin],
    title: 'Modifier le post',
    back: route('/posts/[id]', id),
  }),
  '/(app)/posts/[id]/edit/event': ({ params: { id } }) => ({
    title: 'Évènement lié au post',
    actions: [commonActions.delete, commonActions.pin],
    back: route('/posts/[id]/edit/body', id),
  }),
  '/(app)/posts/[id]/edit/links': ({ params: { id } }) => ({
    title: 'Liens du post',
    actions: [commonActions.delete, commonActions.pin],
    back: route('/posts/[id]/edit/body', id),
  }),
  '/(app)/posts/[id]/edit/picture': ({ params: { id } }) => ({
    title: 'Image du post',
    actions: [commonActions.delete, commonActions.pin],
    back: route('/posts/[id]/edit/body', id),
  }),
  '/(app)/posts/[id]/edit/visibility': ({ params: { id } }) => ({
    title: 'Visibilité du post',
    actions: [commonActions.delete, commonActions.pin],
    back: route('/posts/[id]/edit/body', id),
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
        do: () => navigationTopActionEventDispatcher('NAVTOP_CREATE_POST_ON_EVENT'),
      },
      commonActions.pin,
      commonActions.copyID,
    ],
  }),
  '/(app)/events/[id]/join/[code]': ({ params: { id } }) => ({
    title: 'Invitation',
    back: route('/events/[id]', id),
    actions: [],
  }),
  '/(app)/events/[id]/scan': ({ params: { id } }) => ({
    title: 'Scanner des billets',
    back: route('/events/[id]', id),
    actions: [
      {
        icon: IconBookingsList,
        label: 'Voir les réservations',
        href: refroute('/events/[id]/bookings', id),
      },
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
  '/(app)/events/[id]/edit/ticket-groups/[group]': ({ params }) => ({
    title: 'Groupe de billets',
    back: route('/events/[id]/edit/tickets', params.id),
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
  '/(app)/events/[id]/edit/tickets/[ticket]/group': ({ params }) => ({
    title: 'Groupe du billet',
    back: route('/events/[id]/edit/tickets/[ticket]', params),
    actions: [],
  }),
  '/(app)/events/[id]/edit/tickets/[ticket]/counting': ({ params }) => ({
    title: 'Comptage des places',
    back: route('/events/[id]/edit/tickets/[ticket]', params),
    actions: [],
  }),
  '/(app)/events/[id]/edit/tickets/[ticket]/payment': ({ params }) => ({
    title: 'Moyens de paiement',
    back: route('/events/[id]/edit/tickets/[ticket]', params),
    actions: [],
  }),
  '/(app)/events/[id]/edit/tickets/[ticket]/invited': ({ params }) => ({
    title: 'Billet sur invitation',
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
        do: () => navigationTopActionEventDispatcher('NAVTOP_DOWNLOAD_CSV'),
      },
      commonActions.pin,
    ],
  }),
  '/(app)/users/[uid]/edit': ({ params: { uid } }) => ({
    title: 'Modifier le profil',
    back: route('/[uid=uid]', uid),
    actions: [],
  }),
  '/(app)/users/[uid]/edit/permissions': ({ params: { uid } }) => ({
    title: `Permissions de ${uid}`,
    back: route('/users/[uid]/edit', uid),
    actions: [],
  }),
  '/(app)/users/[uid]/edit/bio': ({ params: { uid } }) => ({
    title: 'Bio',
    back: route('/users/[uid]/edit', uid),
    actions: [],
  }),
  '/(app)/users/[uid]/edit/contributions': ({ params: { uid } }) => ({
    title: 'Cotisations',
    back: route('/users/[uid]/edit', uid),
    actions: [],
  }),
  '/(app)/users/[uid]/edit/curriculum': ({ params: { uid } }) => ({
    title: 'Cursus scolaire',
    back: route('/users/[uid]/edit', uid),
    actions: [],
  }),
  '/(app)/users/[uid]/edit/email': ({ params: { uid } }) => ({
    title: 'E-mail',
    back: route('/users/[uid]/edit', uid),
    actions: [],
  }),
  '/(app)/users/[uid]/edit/family': ({ params: { uid } }) => ({
    title: 'Fillot·e·s',
    back: route('/users/[uid]/edit', uid),
    actions: [],
  }),
  '/(app)/users/[uid]/edit/links': ({ params: { uid } }) => ({
    title: 'Liens sur le profil',
    back: route('/users/[uid]/edit', uid),
    actions: [],
  }),
  '/(app)/users/[uid]/edit/name': ({ params: { uid } }) => ({
    title: 'Prénom & nom de famille',
    back: route('/users/[uid]/edit', uid),
    actions: [],
  }),
  '/(app)/users/[uid]/edit/other-emails': ({ params: { uid } }) => ({
    title: 'E-mails secondaires',
    back: route('/users/[uid]/edit', uid),
    actions: [],
  }),
  '/(app)/groups/[uid]/members': ({ params: { uid } }) => ({
    title: `Membres de ${uid}`,
    back: route('/[uid=uid]', uid),
    quickAction: {
      icon: IconAdd,
      do: () => navtopPushState('NAVTOP_CREATING_GROUP_MEMBER'),
      label: 'Ajouter',
    },
    actions: [
      {
        icon: IconAddBulk,
        href: route('/groups/[uid]/edit/members/bulk', uid),
        label: 'Ajouter en masse',
      },
    ],
  }),
  '/(app)/groups/[uid]/edit': ({ params: { uid } }) => ({
    title: `Modifier ${uid}`,
    back: route('/[uid=uid]', uid),
    actions: [],
  }),
  '/(app)/groups/[uid]/edit/bank-accounts': ({ params: { uid } }) => ({
    title: 'Comptes bancaires',
    back: route('/groups/[uid]/edit', uid),
    actions: [],
  }),
  '/(app)/groups/[uid]/edit/bio': ({ params: { uid } }) => ({
    title: 'Bio',
    back: route('/groups/[uid]/edit', uid),
    actions: [],
  }),
  '/(app)/groups/[uid]/edit/links': ({ params: { uid } }) => ({
    title: 'Liens sur le profil',
    back: route('/groups/[uid]/edit', uid),
    actions: [],
  }),
  '/(app)/groups/[uid]/edit/members/bulk': ({ params: { uid } }) => ({
    title: 'Ajout en masse de membres',
    back: route('/groups/[uid]/members', uid),
    actions: [],
  }),
  '/(app)/groups/[uid]/edit/pages/[...page]': ({ params: { uid, page } }) => ({
    title: `Modifier ${page}`,
    back: route('/groups/[uid]/edit/pages', uid),
    actions: [],
  }),
  '/(app)/groups/[uid]/edit/pages': ({ params: { uid } }) => ({
    title: 'Gérer les pages',
    back: route('/groups/[uid]/edit', uid),
    actions: [],
  }),
  '/(app)/groups/[uid]/edit/type': ({ params: { uid } }) => ({
    title: 'Type de groupe',
    back: route('/groups/[uid]/edit', uid),
    actions: [],
  }),
  '/(app)/bookings/[code]': ({ params: { code } }) => ({
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
  '/(app)/quick-signups/manage': {
    title: 'Inscriptions rapides',
    back: route('/backrooms'),
    actions: rootPagesActions,
  },
  '/(app)/quick-signups/create': {
    title: 'Nouvelle inscription rapide',
    back: route('/quick-signups/manage'),
    actions: [],
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
