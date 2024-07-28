import { pushState } from '$app/navigation';
import { page } from '$app/stores';
import { route } from '$lib/ROUTES';
import { get } from 'svelte/store';
import IconAdd from '~icons/msl/add-circle-outline';
import IconAnnouncement from '~icons/msl/campaign-outline';
import IconXML from '~icons/msl/code';
import IconTrash from '~icons/msl/delete-outline';
import IconDownload from '~icons/msl/download';
import IconPen from '~icons/msl/edit-outline';
import IconDonate from '~icons/msl/euro';
import IconEvent from '~icons/msl/event-outline';
import IconGift from '~icons/msl/featured-seasonal-and-gifts-rounded';
import IconGroup from '~icons/msl/group-outline';
import IconInformation from '~icons/msl/info-outline';
import IconForm from '~icons/msl/list-alt-outline';
import IconNotificationSettings from '~icons/msl/notifications-outline';
import IconPostAdd from '~icons/msl/post-add';
import IconPin from '~icons/msl/push-pin-outline';
import IconScanQR from '~icons/msl/qr-code-scanner';
import IconCog from '~icons/msl/settings-outline';
import IconShield from '~icons/msl/shield-outline';
import IconPost from '~icons/msl/text-ad-outline';
import IconBookingsList from '~icons/msl/view-list-outline';
import IconWallet from '~icons/msl/wallet';
import type { LayoutRouteId } from '../routes/$types';
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
  u.searchParams.set('from', referrer?.toString() ?? get(page).url.toString());
  u.host = '';
  u.protocol = '';
  return u.toString();
}

export type NavigationTopActionEvent = `NAVTOP_${'COPY_ID' | 'DOWNLOAD_BOOKINGS_EXCEL'}`;
const navigationTopActionEventDispatcher = (eventID: NavigationTopActionEvent) => {
  window.dispatchEvent(new CustomEvent(eventID));
};

export type NotificationTopStateKeys =
  `NAVTOP_${'NOTIFICATION_SETTINGS' | 'PINNING' | 'DELETING' | 'GO_TO_EVENT_DAY'}`;

export type NotificationTopState = Partial<Record<NotificationTopStateKeys, boolean>>;

function navtopPushState(key: NotificationTopStateKeys) {
  pushState('', {
    [key]: true,
  } satisfies NotificationTopState);
}

const commonActions = {
  pin: {
    label: 'Accès rapide',
    icon: IconPin,
    async do() {
      // TODO
    },
  },
  delete: {
    label: 'Supprimer',
    icon: IconTrash,
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
  // mobileOnly: true,
  overflow: [
    {
      icon: IconPost,
      label: 'Post',
      href: route('/posts/create'),
    },
    {
      icon: IconEvent,
      label: 'Évènement',
      href: route('/events/create'),
    },
    {
      icon: IconForm,
      label: 'Formulaire',
      href: route('/forms/create'),
    },
    {
      icon: IconGroup,
      label: 'Groupe',
      do: () => alert('TODO'),
    },
    {
      icon: IconAnnouncement,
      label: 'Annonce',
      href: route('/announcements/create'),
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
  {
    icon: IconShield,
    label: 'Zone admins',
    do: () => alert('TODO'),
  },
];

export const topnavConfigs: Partial<
  Record<
    NonNullable<LayoutRouteId>,
    NavigationContext | ((pageParams: Record<string, string>) => NavigationContext)
  >
> = {
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
  '/(app)/posts/[id]': ({ id }) => ({
    actions: [
      commonActions.delete,
      { ...commonActions.edit, href: route('/posts/[id]/edit', id) },
      commonActions.pin,
    ],
    title: 'Post',
  }),
  '/(app)/groups/[uid]': ({ uid }) => ({
    quickAction: quickActionConfigureNotations,
    actions: [
      { ...commonActions.settings, href: route('/groups/[uid]/edit', uid) },
      commonActions.pin,
      commonActions.copyID,
    ],
    title: uid,
  }),
  '/(app)/users/[uid]': ({ uid }) => ({
    actions: [
      { ...commonActions.edit, href: route('/users/[uid]/edit', uid) },
      commonActions.pin,
      commonActions.copyID,
    ],
    title: uid,
  }),
  '/(app)/student-associations/[uid]': ({ uid }) => ({
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
  '/(app)/events/[id]': ({ id }) => ({
    title: 'Évènement',
    quickAction: {
      icon: IconScanQR,
      href: route('/events/[id]/scan', id),
    },
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
  '/(app)/events/[id]/bookings': ({ id }) => ({
    title: 'Réservations',
    quickAction: {
      icon: IconScanQR,
      href: route('/events/[id]/scan', id),
    },
    actions: [
      { ...commonActions.edit, href: route('/events/[id]/edit', id) },
      {
        icon: IconDownload,
        label: 'Excel',
        do: () => navigationTopActionEventDispatcher('NAVTOP_DOWNLOAD_BOOKINGS_EXCEL'),
      },
      commonActions.pin,
    ],
  }),
};
