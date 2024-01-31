export const userCanEditAnnouncements = (user: undefined | { admin: boolean }): boolean =>
  Boolean(user?.admin);
