import { builder } from '#lib';
import {
  EventManagerPowerLevelType,
  EventType,
  EventTypePrismaIncludes,
  permissionsToPowerlevel,
} from '#modules/events';
import { GroupMemberPrismaIncludes, GroupMemberType } from '#modules/groups';
import { UserType, UserTypePrismaIncludes } from '#modules/users';
import type { EventManager, Prisma } from '@churros/db/prisma';

export type InheritedEventManager = Omit<EventManager, 'id'> & {
  event: Prisma.EventGetPayload<{ include: typeof EventTypePrismaIncludes }>;
  groupMember: Prisma.GroupMemberGetPayload<{ include: typeof GroupMemberPrismaIncludes }>;
  user: Prisma.UserGetPayload<{ include: typeof UserTypePrismaIncludes }>;
};

export const InheritedEventManagerType = builder
  .objectRef<InheritedEventManager>('InheritedEventManager')
  .implement({
    description: "Un manager d'évènement hérité par ses permissions en tant que membre d'un groupe",
    fields: (t) => ({
      canVerifyRegistrations: t.exposeBoolean('canVerifyRegistrations'),
      canEdit: t.exposeBoolean('canEdit'),
      canEditPermissions: t.exposeBoolean('canEditPermissions'),
      event: t.field({
        type: EventType,
        resolve: ({ event }) => event,
      }),
      groupMember: t.field({
        type: GroupMemberType,
        resolve: ({ groupMember }) => groupMember,
      }),
      user: t.field({
        type: UserType,
        resolve: ({ user }) => user,
      }),
      power: t.field({
        type: EventManagerPowerLevelType,
        resolve(permissions) {
          return permissionsToPowerlevel(permissions);
        },
      }),
    }),
  });
