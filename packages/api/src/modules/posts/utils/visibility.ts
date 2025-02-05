import { Visibility } from '@churros/db/prisma';

export const VISIBILITIES_BY_VERBOSITY = [
  Visibility.Private,
  Visibility.Unlisted,
  Visibility.GroupRestricted,
  Visibility.SchoolRestricted,
  Visibility.Public,
];

/**
 * Compares two visibilities by their verbosity.
 * @returns newVisibility **>** oldVisibility (strictly more visible)
 */
export function isMoreVisible(newVisibility: Visibility, oldVisibility: Visibility) {
  return (
    VISIBILITIES_BY_VERBOSITY.indexOf(newVisibility) >
    VISIBILITIES_BY_VERBOSITY.indexOf(oldVisibility)
  );
}
