/**
 * Maps database ID prefixes to GraphQL type names. Please add new types here as they are added to
 * the schema, by running node scripts/update-id-prefix-to-typename-map.js.
 */
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
  eminvite: 'EventManagerInvite',
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
  reac: 'Reaction',
  promocode: 'PromotionCode',
  promo: 'Promotion',
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

export const TYPENAMES_TO_ID_PREFIXES = Object.fromEntries(
  Object.entries(ID_PREFIXES_TO_TYPENAMES).map(([prefix, typename]) => [typename, prefix]),
) as Record<
  (typeof ID_PREFIXES_TO_TYPENAMES)[keyof typeof ID_PREFIXES_TO_TYPENAMES],
  keyof typeof ID_PREFIXES_TO_TYPENAMES
>;

export function removeIdPrefix(id: string): string {
  if (id.split(':').length !== 2) throw new Error(`Cannot remove id prefix from ${id}`);
  const [prefix, rest] = id.split(':') as [string, string];
  if (!(prefix in ID_PREFIXES_TO_TYPENAMES)) throw new Error(`Unknown prefix: ${prefix}`);
  return rest;
}

export function ensureGlobalId(id: string, typename: keyof typeof TYPENAMES_TO_ID_PREFIXES): string;
export function ensureGlobalId(
  id: string | null | undefined,
  typename: keyof typeof TYPENAMES_TO_ID_PREFIXES,
): string | null | undefined {
  if (!id) return id;
  if (id.split(':').length === 2) return id;
  if (!(typename in TYPENAMES_TO_ID_PREFIXES)) throw new Error(`Unknown typename: ${typename}`);
  return `${TYPENAMES_TO_ID_PREFIXES[typename]}:${id}`;
}

/**
 * Split a global ID into its typename and local ID parts.
 * @param id The global ID to split
 */
export function splitID(id: string): [keyof typeof TYPENAMES_TO_ID_PREFIXES, string] {
  if (id.split(':').length !== 2) throw new Error(`Malformed ID ${id}`);
  const [prefix, rest] = id.split(':') as [string, string];
  if (!(prefix in ID_PREFIXES_TO_TYPENAMES)) throw new Error(`Unknown prefix: ${prefix}`);
  return [ID_PREFIXES_TO_TYPENAMES[prefix as keyof typeof ID_PREFIXES_TO_TYPENAMES], rest];
}

export function localID(id: string) {
  return splitID(id)[1];
}

export function makeGlobalID(typename: keyof typeof TYPENAMES_TO_ID_PREFIXES, localID: string) {
  return `${TYPENAMES_TO_ID_PREFIXES[typename]}:${localID}`;
}

export function encodeGlobalID(_typename: string, id: string | number | bigint) {
  return id.toString();
}
export function decodeGlobalID(globalID: string) {
  const [typename, id] = globalID.split(':');
  if (!typename || !id) throw new Error(`Invalid global ID: ${globalID}`);
  if (!(typename in ID_PREFIXES_TO_TYPENAMES)) throw new Error(`Unknown typename: ${typename}`);
  return {
    typename: ID_PREFIXES_TO_TYPENAMES[typename as keyof typeof ID_PREFIXES_TO_TYPENAMES],
    id: globalID,
  };
}

export function isGlobalID(id: string): boolean {
  return Object.keys(TYPENAMES_TO_ID_PREFIXES).some((typename) =>
    isGlobalIdOf(typename as keyof typeof TYPENAMES_TO_ID_PREFIXES, id),
  );
}

export function isGlobalIdOf(typename: keyof typeof TYPENAMES_TO_ID_PREFIXES, id: string): boolean {
  return id.startsWith(TYPENAMES_TO_ID_PREFIXES[typename] + ':');
}
