import { builder, splitID } from '#lib';
import { GroupType } from '#modules/groups';
import { SchoolType } from '#modules/schools';
import { StudentAssociationType } from '#modules/student-associations';

export const ServiceOwnerType = builder.unionType('ServiceOwner', {
  description: "Responsable d'un service",
  types: [GroupType, StudentAssociationType, SchoolType],
  resolveType({ id }) {
    const [typename] = splitID(id);
    return typename;
  },
});
