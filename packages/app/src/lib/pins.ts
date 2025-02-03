import { browser } from '$app/environment';
import {
  graphql,
  PinDisplayEventStore,
  PinDisplayPostStore,
  PinDisplayProfilePageStore,
  PinDisplayServiceStore,
} from '$houdini';
import { nativeIcon } from '$lib/native-icons';
import { route } from '$lib/ROUTES';
import { isDark } from '$lib/theme';
import { TYPENAMES_TO_ID_PREFIXES } from '$lib/typenames';
import { Capacitor } from '@capacitor/core';
import { AppShortcuts } from '@capawesome/capacitor-app-shortcuts';
import type { Page } from '@sveltejs/kit';
import { get } from 'svelte/store';
import IconMajor from '~icons/msl/account-tree-outline';
import IconPage from '~icons/msl/bookmark-outline';
import IconEvent from '~icons/msl/event-outline';
import IconGroup from '~icons/msl/group-outline';
import IconStudentAssociation from '~icons/msl/group-work-outline';
import IconUser from '~icons/msl/person-outline';
import IconSchool from '~icons/msl/school-outline';
import IconPost from '~icons/msl/text-ad-outline';
import IconService from '~icons/msl/widgets-outline';

graphql(`
  query PinDisplayPost($postId: LocalID!) @cache(policy: CacheOrNetwork) {
    article(id: $postId) {
      title
      pictureURL
    }
  }
`);

graphql(`
  query PinDisplayEvent($eventId: LocalID!) @cache(policy: CacheOrNetwork) {
    event(id: $eventId) {
      title
      pictureURL
    }
  }
`);

graphql(`
  query PinDisplayProfilePage($uid: UID!) @cache(policy: CacheOrNetwork) {
    profile(uid: $uid) {
      __typename
      ... on Group {
        name
        pictureURL
        darkPictureURL: pictureURL(dark: true)
      }
      ... on User {
        pictureURL
        darkPictureURL: pictureURL(dark: true)
      }
      ... on StudentAssociation {
        pictureURL
        darkPictureURL: pictureURL(dark: true)
      }
      ... on School {
        name
        pictureURL
        darkPictureURL: pictureURL(dark: true)
      }
      ... on Major {
        name: shortName
        pictureURL
        darkPictureURL: pictureURL(dark: true)
      }
    }
  }
`);

graphql(`
  query PinDisplayService($serviceId: LocalID!) @cache(policy: CacheOrNetwork) {
    service(id: $serviceId) {
      name
      logo
      logoSourceType
    }
  }
`);

/**
 * Compute additional information to use when displaying a pinned page.
 */
export async function pinDisplay(path: string) {
  const idOrUid = path.split('/')[2];
  if (!browser) {
    return {
      title: path,
      icon: IconPage,
      nativeIcon: nativeIcon('favorite'),
    };
  }
  try {
    if (
      path.split(':').filter(Boolean).length === 2 &&
      path.startsWith(TYPENAMES_TO_ID_PREFIXES.Service)
    ) {
      const service = await new PinDisplayServiceStore()
        .fetch({ variables: { serviceId: path } })
        .then((r) => r.data?.service);
      return {
        title: service?.name ?? 'Service',
        nativeIcon: nativeIcon('favorite'),
        icon:
          (service?.logo
            ? service.logoSourceType === 'ExternalLink'
              ? service.logo
              : route('GET /[uid=uid].png', service.logo)
            : IconService) || IconService,
      };
    }
    if (path.split('/').filter(Boolean).length === 1 && /^[\w-]+$/.test(path.split('/')[1])) {
      const uid = path.split('/')[1];
      const fallbackIcons = {
        User: IconUser,
        Group: IconGroup,
        StudentAssociation: IconStudentAssociation,
        School: IconSchool,
        Major: IconMajor,
      } as const;

      const nativeIcons = {
        User: nativeIcon('contact'),
        Group: nativeIcon('favorite'),
        StudentAssociation: nativeIcon('favorite'),
        School: nativeIcon('location'),
        Major: nativeIcon('favorite'),
      } as const;

      const profile = await new PinDisplayProfilePageStore()
        .fetch({ variables: { uid } })
        .then((r) => r.data?.profile);
      if (profile) {
        return {
          title: 'name' in profile ? profile.name : uid,
          nativeIcon: nativeIcons[profile.__typename],
          icon:
            ('pictureURL' in profile
              ? get(isDark)
                ? profile.darkPictureURL
                : profile.pictureURL
              : '') || fallbackIcons[profile.__typename],
        };
      }
    }
    switch (path.split('/')[1]) {
      case 'posts': {
        const article = await new PinDisplayPostStore()
          .fetch({ variables: { postId: idOrUid } })
          .then((r) => r.data?.article);

        return {
          title: article?.title ?? 'Post',
          icon: article?.pictureURL || IconPost,
          nativeIcon: nativeIcon('message'),
        };
      }
      case 'events': {
        const event = await new PinDisplayEventStore()
          .fetch({ variables: { eventId: idOrUid } })
          .then((r) => r.data?.event);
        const title = event?.title ?? 'Évènement';
        return {
          title: path.split(/[/?]/g).includes('bookings') ? `${title}: Résas` : title,
          icon: event?.pictureURL || IconEvent,
          nativeIcon: nativeIcon('date'),
        };
      }
      default: {
        return {
          title: path,
          icon: IconPage,
          nativeIcon: nativeIcon('favorite'),
        };
      }
    }
  } catch {
    return {
      title: path,
      icon: IconPage,
      nativeIcon: nativeIcon('favorite'),
    };
  }
}

export async function pinCurrentPage(page: Page) {
  const BookmarkPage = graphql(`
    mutation BookmarkPage($path: String!) {
      bookmark(path: $path) {
        ...List_Bookmarks_insert @allLists
      }
    }
  `);
  await BookmarkPage.mutate({ path: page.url.pathname });

  if (Capacitor.isNativePlatform()) {
    const { nativeIcon, title } = await pinDisplay(page.url.pathname);
    await AppShortcuts.set({
      shortcuts: [
        {
          id: page.url.pathname,
          icon: nativeIcon,
          title,
          description: title, // TODO something different?
        },
      ],
    });
  }
}

export async function unpinCurrentPage(page: Page) {
  const UnbookmarkPage = graphql(`
    mutation UnpinPage($path: String!) {
      unbookmark(path: $path) {
        ...List_Bookmarks_remove @allLists
      }
    }
  `);
  await UnbookmarkPage.mutate({ path: page.url.pathname });

  if (Capacitor.isNativePlatform()) {
    const { shortcuts } = await AppShortcuts.get();
    await AppShortcuts.clear();
    await AppShortcuts.set({
      shortcuts: shortcuts.filter(({ id }) => id !== page.url.pathname),
    });
  }
}

export async function currentPageIsPinned(page: Page) {
  if (!browser) return false;
  // We do't use `pinned` since Houdini wouldn't know how to update the cache store that way
  const { data } = await graphql(`
    query CurrentPageIsPinned @cache(policy: CacheOrNetwork) {
      me {
        bookmarks {
          path
        }
      }
    }
  `).fetch();
  return Boolean(data?.me?.bookmarks.find((b) => b.path === page.url.pathname));
}
