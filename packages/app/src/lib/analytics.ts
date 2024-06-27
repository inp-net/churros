export function umamiAttributes(event: string, data?: Record<string, number | string>) {
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

function toKebabCase(str: string) {
  return str
    .replaceAll(/[ _]/g, '-')
    .replaceAll(/([\da-z]|(?=[A-Z]))([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/^-+/, '');
}
