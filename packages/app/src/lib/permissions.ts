export function isOnClubBoard({
  president,
  secretary,
  vicePresident,
  treasurer,
}: {
  president: boolean;
  secretary: boolean;
  vicePresident: boolean;
  treasurer: boolean;
}): boolean {
  return president || secretary || vicePresident || treasurer;
}

export function canCreateArticle(
  {
    canEditArticles,
    ...role
  }: {
    president: boolean;
    secretary: boolean;
    vicePresident: boolean;
    treasurer: boolean;
    canEditArticles: boolean;
  },
  user: undefined | { admin: boolean }
): boolean {
  return user?.admin || isOnClubBoard(role) || canEditArticles;
}

export function canCreateEvent(
  member: {
    president: boolean;
    secretary: boolean;
    vicePresident: boolean;
    treasurer: boolean;
    canEditArticles: boolean;
  },
  user: undefined | { admin: boolean }
): boolean {
  return canCreateArticle(member, user);
}
