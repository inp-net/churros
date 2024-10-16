import { ENV } from '#lib';
import webpush from 'web-push';

export function setVapidDetails() {
  if (ENV().PUBLIC_CONTACT_EMAIL && ENV().PUBLIC_VAPID_KEY && ENV().VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      `mailto:${ENV().PUBLIC_CONTACT_EMAIL}`,
      ENV().PUBLIC_VAPID_KEY,
      ENV().VAPID_PRIVATE_KEY,
    );
  }
}
