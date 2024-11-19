import { builder, prisma } from '#lib';
import { EventType, InheritedEventManagerType } from '#modules/events/types';
import { GroupMemberPrismaIncludes } from '#modules/groups';
import { UserTypePrismaIncludes } from '#modules/users';

builder.prismaObjectField(EventType, 'inheritedManagers', (t) =>
  t.field({
    type: [InheritedEventManagerType],
    description:
      "Managers de l'évènement qui le sont par leur permissions sur le groupe organisateur de l'évènement.",
    async resolve(event) {
      const members = await prisma.groupMember.findMany({
        where: {
          group: {
            events: {
              some: { id: event.id },
            },
          },
          canScanEvents: true,
        },
        include: {
          ...GroupMemberPrismaIncludes,
          member: {
            include: UserTypePrismaIncludes,
          },
        },
      });

      return members.map((member) => ({
        eventId: event.id,
        event,
        user: member.member,
        groupMember: member,
        userId: member.memberId,
        canEdit: false,
        canEditPermissions: false,
        canSeeAllBookings: true,
        canVerifyRegistrations: true,
      }));
    },
  }),
);
