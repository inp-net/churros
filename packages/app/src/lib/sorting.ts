export const byMemberGroupTitleImportance = (
  a: { title: string; president: boolean; treasurer: boolean },
  b: { title: string; president: boolean; treasurer: boolean }
) => {
  if (a.title.toLowerCase() === 'membre') return 1;
  if (b.title.toLowerCase() === 'membre') return -1;
  if (a.president !== b.president) return b.president ? 1 : -1;
  if (a.treasurer !== b.treasurer) return b.treasurer ? 1 : -1;
  if (a.title !== b.title) return a.title.localeCompare(b.title);
  return 0;
};
