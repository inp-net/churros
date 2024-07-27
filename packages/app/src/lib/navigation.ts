import { pushState } from '$app/navigation';
import { page } from '$app/stores';
import type { OverflowMenuAction } from '$lib/components/OverflowMenu.svelte';
import { route } from '$lib/ROUTES';
import { get } from 'svelte/store';
import IconAdd from '~icons/msl/add';
import IconAnnouncement from '~icons/msl/campaign-outline';
import IconXML from '~icons/msl/code';
import IconPen from '~icons/msl/edit-outline';
import IconEvent from '~icons/msl/event-outline';
import IconGift from '~icons/msl/featured-seasonal-and-gifts-rounded';
import IconGroup from '~icons/msl/group-outline';
import IconInformation from '~icons/msl/info-outline';
import IconForm from '~icons/msl/list-alt-outline';
import IconPin from '~icons/msl/push-pin-outline';
import IconShield from '~icons/msl/shield-outline';
import IconPost from '~icons/msl/text-ad-outline';
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

const commonActions = {
  pin: {
    label: 'Accès rapide',
    icon: IconPin,
    async do() {
      // TODO
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, OverflowMenuAction<any>>;

const quickActionAdd = {
  icon: IconAdd,
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
          pushState('./pinning', {
            editingPings: true,
          });
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
  '/(app)/posts/[id]': {
    actions: [commonActions.pin],
    title: 'Post',
  },
  '/(app)/groups/[uid]': ({ uid }) => ({
    actions: [commonActions.pin],
    title: uid,
  }),
  '/(app)/users/[uid]': ({ uid }) => ({
    actions: [commonActions.pin],
    title: uid,
  }),
};
