import { redirectToLogin } from '$lib/session';
import { Selector, loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const _notificationsQuery = Selector('Notification')({
  pageInfo: { hasNextPage: true, startCursor: true },
  edges: {
    cursor: true,
    node: {
      id: true,
      title: true,
      body: true,
      goto: true,
      imageFile: true,
      timestamp: true,
      type: true,
      group: {
        uid: true,
        name: true,
        pictureFile: true,
      },
      actions: {
        name: true,
        value: true,
        computedValue: true,
      },
    },
  },
});

export const load: PageLoad = async ({ fetch, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  return loadQuery(
    {
      notificationSubscriptions: Selector('NotificationSubscription')({
        endpoint: true,
      }),
      // yes, this returns an empty array.
      // it's a way to get the type on +page.svelte
      // since we have to declare the variable upfront but need to get the data in onMount, since the subscriptionEndpoint is only known with navigator.serviceWorker.ready
      notifications: [
        {
          subscriptionEndpoint: 'inexistent',
        },
        _notificationsQuery,
      ],
    },
    { fetch, parent }
  );
};
