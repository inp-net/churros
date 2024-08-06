import { browser } from '$app/environment';

export function umamiAttributes(event: string | undefined, data?: Record<string, number | string>) {
  if (!event) return {};
  return {
    'data-umami-event': event,
    ...Object.fromEntries(
      Object.entries(data ?? {}).map(([key, value]) => [
        `data-umami-event-${toKebabCase(key)}`,
        value,
      ]),
    ),
  };
}

export function track(event: string, data?: Record<string, number | string>) {
  if (browser && window.umami) window.umami.track(event, data);
}

function toKebabCase(str: string) {
  return str
    .replaceAll(/[ _]/g, '-')
    .replaceAll(/([\da-z]|(?=[A-Z]))([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/^-+/, '');
}
