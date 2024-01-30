import webpush from 'web-push';

export function setVapidDetails() {
  if (
    process.env.PUBLIC_CONTACT_EMAIL &&
    process.env.PUBLIC_VAPID_KEY &&
    process.env.VAPID_PRIVATE_KEY
  ) {
    webpush.setVapidDetails(
      `mailto:${process.env.PUBLIC_CONTACT_EMAIL}`,
      process.env.PUBLIC_VAPID_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );
  }
}
