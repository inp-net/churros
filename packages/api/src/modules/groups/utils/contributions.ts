import { GroupType } from '@churros/db/prisma';

export function membersNeedToPayForTheStudentAssociation(group: { type: GroupType }): boolean {
  return group.type === GroupType.Club || group.type === GroupType.List;
}
