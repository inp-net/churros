import { browser } from '$app/environment';
import {
  graphql,
  PinDisplayEventStore,
  PinDisplayGroupStore,
  PinDisplayPostStore,
  PinDisplayStudentAssociationStore,
  PinDisplayUserStore,
} from '$houdini';
import { isDark } from '$lib/theme';
import type { Page } from '@sveltejs/kit';
import { get } from 'svelte/store';
import IconPage from '~icons/msl/bookmark-outline';
import IconEvent from '~icons/msl/event-outline';
import IconGroup from '~icons/msl/group-outline';
import IconStudentAssociation from '~icons/msl/group-work-outline';
import IconUser from '~icons/msl/person-outline';
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
  query PinDisplayGroup($uid: String!) @cache(policy: CacheOrNetwork) {
    group(uid: $uid) {
      pictureURL
      darkPictureURL: pictureURL(dark: true)
      name
    }
  }
`);

graphql(`
  query PinDisplayUser($uid: String!) @cache(policy: CacheOrNetwork) {
    user(uid: $uid) {
      fullName
      pictureURL
    }
  }
`);

graphql(`
  query PinDisplayStudentAssociation($uid: String!) @cache(policy: CacheOrNetwork) {
    studentAssociation(uid: $uid) {
      name
      pictureURL
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
        return {
          title: event?.title ?? 'Évènement',
          icon: event?.pictureURL || IconEvent,
        };
      }
      case 'groups': {
        const group = await new PinDisplayGroupStore()
          .fetch({ variables: { uid: idOrUid } })
          .then((r) => r.data?.group);
        return {
          title: group?.name ?? `@${idOrUid}`,
          icon: (get(isDark) ? group?.darkPictureURL : group?.pictureURL) || IconGroup,
        };
      }
      case 'users': {
        const user = await new PinDisplayUserStore()
          .fetch({ variables: { uid: idOrUid } })
          .then((r) => r.data?.user);
        return {
          title: user?.fullName ?? `@${idOrUid}`,
          icon: user?.pictureURL || IconUser,
        };
      }
      case 'student-associations': {
        const studentAssociation = await new PinDisplayStudentAssociationStore()
          .fetch({ variables: { uid: idOrUid } })
          .then((r) => r.data?.studentAssociation);
        return {
          title: studentAssociation?.name ?? `@${idOrUid}`,
          icon: studentAssociation?.pictureURL || IconStudentAssociation,
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
  const PinPage = graphql(`
    mutation PinPage($path: String!) {
      pin(path: $path) {
        ...List_Pins_insert @allLists
      }
    }
  `);
  await PinPage.mutate({ path: page.url.pathname });
}

export async function unpinCurrentPage(page: Page) {
  const UnpinPage = graphql(`
    mutation UnpinPage($path: String!) {
      unpin(path: $path) {
        ...List_Pins_remove @allLists
      }
    }
  `);
  await UnpinPage.mutate({ path: page.url.pathname });
}

export async function currentPageIsPinned(page: Page) {
  if (!browser) return false;
  const { data } = await graphql(`
    query CurrentPageIsPinned @cache(policy: CacheOrNetwork) {
      me {
        pins {
          path
        }
      }
    }
  `).fetch();
  return Boolean(data?.me?.pins.find((pin) => pin.path === page.url.pathname));
}
