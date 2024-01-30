import { GroupType } from '@prisma/client';

export function membersNeedToPayForTheStudentAssociation(group: { type: GroupType }): boolean {
  return group.type === GroupType.Club || group.type === GroupType.List;
}
