import { builder, splitID } from '#lib';
import { MajorType } from '#modules/curriculum';
import { GroupType } from '#modules/groups';
import { SchoolType } from '#modules/schools';
import { StudentAssociationType } from '#modules/student-associations';
import { UserType } from '#modules/users';

export const ProfileType = builder.unionType('Profile', {
  description:
    "Resource possédant un '@' (uid) et pouvant raisonnablement posséder une page de profil, avec nom, photo, bio/description...",
  types: [UserType, GroupType, StudentAssociationType, SchoolType, MajorType],
  async resolveType({ id }) {
    return splitID(id)[0];
  },
});
