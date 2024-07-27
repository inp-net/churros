export const DESKTOP_NAVIGATION_TABS = [
  'home',
  'groups',
  'events',
  'documents',
  'reports',
  'services',
  'signups',
  'announcements',
  'backrooms',
  'forms',
] as const;

export const MOBILE_NAVIGATION_TABS = ['home', 'search', 'events', 'services', 'me'] as const;

export function currentTabDesktop(url: URL): (typeof DESKTOP_NAVIGATION_TABS)[number] {
  const starts = (segment: string) => url.pathname.startsWith(segment);

  if (starts('/groups')) return 'groups';
  if (starts('/week') || starts('/booking') || starts('/events')) return 'events';
  if (starts('/services')) return 'services';
  if (starts('/documents')) return 'documents';
  if (starts('/signups')) return 'signups';
  if (starts('/backrooms') || starts('/logs')) return 'backrooms';
  if (starts('/reports')) return 'reports';
  if (starts('/announcements')) return 'announcements';
  if (starts('/forms')) return 'forms';
  return 'home';
}

export function currentTabMobile(url: URL): (typeof MOBILE_NAVIGATION_TABS)[number] {
  const tab = currentTabDesktop(url);
  for (const mobileTab of MOBILE_NAVIGATION_TABS) if (mobileTab === tab) return tab;

  return 'services';
}
