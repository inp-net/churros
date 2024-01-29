export const userCanEditAnnouncements = (user: undefined | {admin: boolean}): boolean =>
    user?.admin
