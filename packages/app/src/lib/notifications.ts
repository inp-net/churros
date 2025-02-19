import { env } from '$env/dynamic/public';
import {
  graphql,
  type NotificationsSubscribedCheck$data,
  type SubscribeToNotifications$input,
} from '$houdini';
import { arrayBufferToBase64 } from '$lib/base64';
import { route } from '$lib/ROUTES';
import { toasts } from '$lib/toasts';
import { removeIdPrefix, typenameOfId } from '$lib/typenames';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { PushNotifications } from '@capacitor/push-notifications';
import * as Notella from '@inp-net/notella';

graphql(`
  fragment NotificationsSubscribedCheck on NotificationSubscription {
    endpoint
  }
`);

export async function checkIfSubscribed(subscriptions: NotificationsSubscribedCheck$data[]) {
  const ok = await requestPermissions();
  if (!ok) return;

  if (Capacitor.isNativePlatform()) {
    return await Preferences.get({ key: 'notificationToken' }).then(({ value }) =>
      value
        ? subscriptions.find(({ endpoint }) => endpoint === endpointFromToken(value))
        : undefined,
    );
  } else {
    if (Notification.permission !== 'granted') return;

    const sw = await navigator.serviceWorker.ready;
    const subscription = await sw.pushManager.getSubscription();
    return subscriptions.find(({ endpoint }) => endpoint === subscription?.endpoint);
  }
}

export async function unsubscribeFromNotifications(): Promise<void> {
  let endpoint: string | null = null;
  if (Capacitor.isNativePlatform()) {
    endpoint = await Preferences.get({ key: 'notificationToken' }).then(({ value }) =>
      value ? endpointFromToken(value) : null,
    );
    await PushNotifications.unregister();
  } else {
    if ((await Notification.requestPermission()) === 'granted') {
      const sw = await navigator.serviceWorker.ready;
      const subscription = await sw.pushManager.getSubscription();
      if (!subscription) return;
      endpoint = subscription.endpoint;
    }
  }

  if (!endpoint) return;

  const result = await graphql(`
    mutation UnsubscribeFromNotifications($endpoint: String!) {
      unsubscribeFromNotifications(endpoint: $endpoint) {
        ...MutationErrors
        ... on MutationUnsubscribeFromNotificationsSuccess {
          data {
            id
          }
        }
      }
    }
  `).mutate({ endpoint });

  toasts.mutation(
    result,
    'unsubscribeFromNotifications',
    '',
    'Impossible de désactiver les notifications',
  );
}

export async function subscribeToNotifications(): Promise<
  'ok' | 'denied' | 'unsupported' | 'client_error' | 'remote_error'
> {
  let subscribeArgs: SubscribeToNotifications$input | null = null;
  const ok = await requestPermissions();
  if (!ok) return 'denied';

  if (Capacitor.isNativePlatform()) {
    PushNotifications.register();
    const token = await new Promise<string | null>((resolve) => {
      PushNotifications.addListener('registration', (token) => {
        resolve(token.value);
      });
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
        resolve(null);
      });
    });

    if (!token) return 'client_error';

    await Preferences.set({ key: 'notificationToken', value: token });
    subscribeArgs = {
      name: '',
      authKey: '',
      p256dhKey: '',
      endpoint: endpointFromToken(token),
      expiresAt: null,
    };
  } else {
    try {
      toasts.debug('permission granted. aqcuiring sw');
      const sw = await navigator.serviceWorker.ready;
      toasts.debug('checking if browser supports sw');
      if (!sw) return 'unsupported';

      toasts.debug('support OK. subscribing');

      const subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: env.PUBLIC_VAPID_KEY,
      });
      if (!subscription) return 'unsupported';

      toasts.debug(`got sub`, JSON.stringify(subscription));

      const { expirationTime, endpoint } = subscription;
      toasts.debug('start mutation', JSON.stringify({ expirationTime, endpoint }));

      subscribeArgs = {
        name: '',
        authKey: await arrayBufferToBase64(subscription.getKey('auth') ?? new ArrayBuffer(0)),
        p256dhKey: await arrayBufferToBase64(subscription.getKey('p256dh') ?? new ArrayBuffer(0)),
        endpoint,
        expiresAt: expirationTime ? new Date(expirationTime) : null,
      };
    } catch (error) {
      toasts.debug('caught', error?.toString());
      throw error?.toString();
    }
  }

  if (!subscribeArgs) return 'client_error';

  const result = await graphql(`
    mutation SubscribeToNotifications(
      $name: String!
      $authKey: String!
      $p256dhKey: String!
      $endpoint: String!
      $expiresAt: DateTime
    ) {
      subscribeToNotifications(
        name: $name
        endpoint: $endpoint
        keys: { auth: $authKey, p256dh: $p256dhKey }
        expiresAt: $expiresAt
      ) {
        ...MutationErrors
        ... on MutationSubscribeToNotificationsSuccess {
          data {
            id
            expiresAt
            endpoint
          }
        }
      }
    }
  `).mutate(subscribeArgs);

  const success = toasts.mutation(
    result,
    'subscribeToNotifications',
    '',
    "Impossible d'activer les notifications",
  );

  return success ? 'ok' : 'remote_error';
}

function endpointFromToken(token: string): string {
  if (!Capacitor.isNativePlatform()) return token;

  return `${Capacitor.getPlatform() === 'ios' ? 'apns' : 'firebase'}://${token}`;
}

async function requestPermissions(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    const check = await PushNotifications.checkPermissions();
    if (check.receive === 'denied') return false;

    if (check.receive !== 'granted') {
      const check = await PushNotifications.requestPermissions();
      if (check.receive !== 'granted') return false;
    }

    return true;
  }

  const status = await Notification.requestPermission();
  toasts.debug('got permission status', status);
  if (status === 'default') {
    toasts.error("T'a refusé les notifications");
    return false;
  }
  if (status === 'denied') {
    toasts.error(
      'Ton navigateur a refusé les notifications',
      `Réinitialise les permissions de ${env.PUBLIC_FRONTEND_ORIGIN} dans Chrome ou Safari`,
    );
    return false;
  }

  return true;
}

/**
 * Where to go when a notification is clicked
 * @param message the received notification
 */
export async function notificationClickRoute(message: Notella.Message) {
  const MyUid = graphql(`
    query NotificationClickMyUid {
      me {
        uid
      }
    }
  `);

  const { object_id, event, action } = message;
  switch (event) {
    case Notella.Event.BookingPaid: {
      // We except a Booking ID. If it's something else, go to /bookings instead
      if (typenameOfId(object_id) !== 'Registration') return route('/bookings');

      return route('/bookings/[code]', removeIdPrefix('Registration', object_id));
    }

    case Notella.Event.ContributionPaid: {
      const myUid = await MyUid.fetch().then((result) => result.data?.me?.uid);
      return myUid ? route('/users/[uid]/edit/contributions', myUid) : route('/');
    }

    case Notella.Event.GodchildAccepted:
    case Notella.Event.GodchildRejected:
    case Notella.Event.GodchildRequest: {
      const myUid = await MyUid.fetch().then((result) => result.data?.me?.uid);
      return myUid ? route('/users/[uid]/edit/family', myUid) : route('/');
    }

    case Notella.Event.LoginStuck: {
      return route('/signups');
    }

    case Notella.Event.NewPost: {
      if (typenameOfId(object_id) !== 'Article') return route('/');
      return route('/posts/[id]', removeIdPrefix('Article', object_id));
    }

    case Notella.Event.PendingSignup: {
      // TODO change API to allow resolving email from user candidate ID, so we can go to the specific signup edit page
      return route('/signups');
    }

    case Notella.Event.ShotgunClosesSoon:
    case Notella.Event.ShotgunOpensSoon: {
      if (typenameOfId(object_id) !== 'Event') return route('/');
      return route('/events/[id]', removeIdPrefix('Event', object_id));
    }

    case Notella.Event.Test: {
      return route('/notifications');
    }

    case Notella.Event.Custom: {
      return action;
    }
  }

  return undefined;
}
