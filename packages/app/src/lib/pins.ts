import { browser } from '$app/environment';
import {
  graphql,
  PinDisplayEventStore,
  PinDisplayPostStore,
  PinDisplayProfilePageStore,
} from '$houdini';
import { isDark } from '$lib/theme';
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

/**
 * Compute additional information to use when displaying a pinned page.
 */
export async function pinDisplay(path: string) {
  const idOrUid = path.split('/')[2];
  if (!browser) {
    return {
      title: path,
      icon: IconPage,
    };
  }
  try {
    if (path.split('/').filter(Boolean).length === 1 && /^[\w-]+$/.test(path.split('/')[1])) {
      const uid = path.split('/')[1];
      const fallbackIcons = {
        User: IconUser,
        Group: IconGroup,
        StudentAssociation: IconStudentAssociation,
        School: IconSchool,
        Major: IconMajor,
      } as const;

      const profile = await new PinDisplayProfilePageStore()
        .fetch({ variables: { uid } })
        .then((r) => r.data?.profile);
      if (profile) {
        return {
          title: 'name' in profile ? profile.name : uid,
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
        };
      }
      default: {
        return {
          title: path,
          icon: IconPage,
        };
      }
    }
  } catch {
    return {
      title: path,
      icon: IconPage,
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
