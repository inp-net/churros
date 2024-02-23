/**
 * Maps user input replacement keys (e.g. [prenom]) to their user property keys (e.g. firstName)
 */
export const REPLACE_MAP = {
  'prénom': 'firstName',
  'nom': 'lastName',
  'nom de famille': 'lastName',
  'filière': 'major.shortName',
  'uid': 'uid',
  'promo': 'graduationYear',
  'année': 'yearTier',
} as const;
