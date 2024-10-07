/* @generated from schema by /packages/api/scripts/update-id-prefix-to-typename-map.ts */
export const ID_PREFIXES_TO_TYPENAMES = {
  u: 'User',
  bookmark: 'Bookmark',
  godparentreq: 'GodparentRequest',
  candidate: 'UserCandidate',
  passreset: 'PasswordReset',
  emailchange: 'EmailChange',
  quicksignup: 'QuickSignup',
  service: 'Service',
  link: 'Link',
  major: 'Major',
  minor: 'Minor',
  school: 'School',
  credential: 'Credential',
  ae: 'StudentAssociation',
  contribution: 'Contribution',
  contributionoption: 'ContributionOption',
  g: 'Group',
  a: 'Article',
  e: 'Event',
  em: 'EventManager',
  tg: 'TicketGroup',
  t: 'Ticket',
  r: 'Registration',
  log: 'LogEntry',
  lydia: 'LydiaAccount',
  lydiapayment: 'LydiaTransaction',
  paypalpayment: 'PaypalTransaction',
  notifsub: 'NotificationSubscription',
  notif: 'Notification',
  ann: 'Announcement',
  ue: 'TeachingUnit',
  subj: 'Subject',
  doc: 'Document',
  comment: 'Comment',
  reac: 'Reaction',
  promocode: 'PromotionCode',
  promo: 'Promotion',
  picfile: 'Picture',
  shopitem: 'ShopItem',
  shoppayment: 'ShopPayment',
  shopitemoption: 'ShopItemOption',
  shopitemanswer: 'ShopItemAnswer',
  form: 'Form',
  formsection: 'FormSection',
  formjump: 'FormJump',
  question: 'Question',
  answer: 'Answer',
  page: 'Page',
  theme: 'Theme',
  themeval: 'ThemeValue',
} as const;
/* end @generated from schema */

export type IDPrefix = keyof typeof ID_PREFIXES_TO_TYPENAMES;
export type Typename = (typeof ID_PREFIXES_TO_TYPENAMES)[IDPrefix];

export const TYPENAMES_TO_ID_PREFIXES = Object.fromEntries(
  Object.entries(ID_PREFIXES_TO_TYPENAMES).map(([prefix, typename]) => [typename, prefix]),
) as Record<
  (typeof ID_PREFIXES_TO_TYPENAMES)[keyof typeof ID_PREFIXES_TO_TYPENAMES],
  keyof typeof ID_PREFIXES_TO_TYPENAMES
>;

export function removeIdPrefix(
  typename: keyof typeof TYPENAMES_TO_ID_PREFIXES,
  id: string,
): string {
  if (!id.startsWith(`${TYPENAMES_TO_ID_PREFIXES[typename]}:`)) return id;
  return id.replace(`${TYPENAMES_TO_ID_PREFIXES[typename]}:`, '');
}

export function hasIdPrefix(typename: keyof typeof TYPENAMES_TO_ID_PREFIXES, id: string): boolean {
  return id.startsWith(`${TYPENAMES_TO_ID_PREFIXES[typename]}:`);
}

export function ensureIdPrefix(
  typename: keyof typeof TYPENAMES_TO_ID_PREFIXES,
  id: string,
): string {
  if (hasIdPrefix(typename, id)) return id;
  return `${TYPENAMES_TO_ID_PREFIXES[typename]}:${id}`;
}

export function typenameOfId(id: string): Typename | undefined {
  const prefix = id.split(':')[0];
  if (!Object.keys(ID_PREFIXES_TO_TYPENAMES).includes(prefix)) return undefined;
  return ID_PREFIXES_TO_TYPENAMES[prefix as IDPrefix];
}
