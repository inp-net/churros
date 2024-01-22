export const byMemberGroupTitleImportance = (
  a: {
    member: {
      lastName: string;
    };
    title: string;
    president: boolean;
    treasurer: boolean;
    vicePresident: boolean;
    secretary: boolean;
  },
  b: {
    member: {
      lastName: string;
    };
    title: string;
    president: boolean;
    treasurer: boolean;
    vicePresident: boolean;
    secretary: boolean;
  },
) => {
  if (a.president !== b.president) return b.president ? 1 : -1;
  if (a.treasurer !== b.treasurer) return b.treasurer ? 1 : -1;
  if (a.vicePresident !== b.vicePresident) return b.vicePresident ? 1 : -1;
  if (a.secretary !== b.secretary) return b.secretary ? 1 : -1;
  if (a.title === b.title) return a.member.lastName.localeCompare(b.member.lastName);
  if (a.title.toLowerCase() === 'membre') return 1;
  if (b.title.toLowerCase() === 'membre') return -1;
  if (a.title !== b.title) return a.title.localeCompare(b.title);
  return 0;
};
