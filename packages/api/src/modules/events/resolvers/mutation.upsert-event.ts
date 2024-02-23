import { builder, prisma } from '#lib';
import { DateTimeScalar, VisibilityEnum } from '#modules/global';
import { LinkInput } from '#modules/links';
import { TicketGroupInput, TicketInput, createTicketUid } from '#modules/ticketing';
import { onBoard } from '#permissions';
import * as PrismaTypes from '@prisma/client';
import { EventFrequency, GroupType } from '@prisma/client';
import { isBefore } from 'date-fns';
import { GraphQLError } from 'graphql';
import omit from 'lodash.omit';
import {
  EventFrequencyType,
  EventType,
  ManagerOfEventInput,
  createUid,
  scheduleShotgunNotifications,
} from '../index.js';

builder.mutationField('upsertEvent', (t) =>
  t.prismaField({
    type: EventType,
    errors: {},
    validate: ({ startsAt, endsAt }) => isBefore(startsAt, endsAt),
    args: {
      id: t.arg.string({ required: false }),
      ticketGroups: t.arg({ type: [TicketGroupInput] }),
      tickets: t.arg({ type: [TicketInput] }),
      description: t.arg.string(),
      groupUid: t.arg.string(),
      contactMail: t.arg.string(),
      links: t.arg({ type: [LinkInput] }),
      lydiaAccountId: t.arg.string({ required: false }),
      location: t.arg.string(),
      title: t.arg.string(),
      visibility: t.arg({ type: VisibilityEnum }),
      frequency: t.arg({ type: EventFrequencyType }),
      recurringUntil: t.arg({ type: DateTimeScalar, required: false }),
      startsAt: t.arg({ type: DateTimeScalar }),
      endsAt: t.arg({ type: DateTimeScalar }),
      managers: t.arg({ type: [ManagerOfEventInput] }),
      bannedUsers: t.arg.stringList({ description: 'List of user uids' }),
      coOrganizers: t.arg.stringList({ description: 'List of group uids' }),
    },
    async authScopes(_, { id, groupUid }, { user }) {
      const creating = !id;
      if (!user) return false;
      if (user.admin) return true;

      const canCreate = Boolean(
        user.canEditGroups ||
          onBoard(user.groups.find(({ group }) => group.uid === groupUid)) ||
          user.groups.some(
            ({ group, canEditArticles }) => canEditArticles && group.uid === groupUid,
          ),
      );

      if (creating) return canCreate;

      const event = await prisma.event.findUnique({
        where: { id },
        include: { managers: { include: { user: true } } },
      });

      if (!event) return false;

      return Boolean(
        canCreate ||
          event.managers.some(({ user: { uid }, canEdit }) => uid === user.uid && canEdit),
      );
    },
    async resolve(
      query,
      _,
      {
        id,
        ticketGroups,
        lydiaAccountId,
        managers,
        startsAt,
        endsAt,
        tickets,
        description,
        groupUid,
        contactMail,
        links,
        location,
        title,
        visibility,
        frequency,
        coOrganizers,
        bannedUsers,
        recurringUntil,
      },
      { user },
    ) {
      if (frequency !== EventFrequency.Once && tickets.length > 0)
        throw new GraphQLError('Events with a frequency cannot have tickets');

      // TODO send only notifications to people that have canSeeTicket(..., people)  on tickets that changed the shotgun date, and say that the shotgun date changed in the notification
      const shotgunChanged = !id;

      const connectFromListOfUids = (uids: string[]) => uids.map((uid) => ({ uid }));
      const connectFromListOfIds = (ids: string[]) => ids.map((id) => ({ id }));

      const managersWithUserId = await Promise.all(
        managers.map(async (manager) => ({
          ...manager,
          userId: await prisma.user
            .findUnique({ where: { uid: manager.userUid } })
            .then((user) => user?.id ?? ''),
        })),
      );

      const oldEvent = id
        ? await prisma.event.findUnique({ where: { id }, include: { managers: true } })
        : undefined;

      if (id && !oldEvent) throw new Error(`Event ${id} does not exist`);

      const group = await prisma.group.findUnique({ where: { uid: groupUid } });
      if (!group) throw new Error(`Group ${groupUid} does not exist`);

      // 1. Update regular event information
      const event = await prisma.event.upsert({
        ...query,
        where: { id: id ?? '' },
        create: {
          uid: await createUid({ title, groupId: group.id }),
          description,
          group: { connect: { uid: groupUid } },
          contactMail,
          links: { create: links },
          beneficiary: lydiaAccountId ? { connect: { id: lydiaAccountId } } : undefined,
          location,
          title,
          visibility,
          frequency,
          recurringUntil,
          startsAt,
          endsAt,
          managers: {
            create: managers.map((manager) => ({
              user: { connect: { uid: manager.userUid } },
              canEdit: manager.canEdit,
              canEditPermissions: manager.canEditPermissions,
              canVerifyRegistrations: manager.canVerifyRegistrations,
            })),
          },
          coOrganizers: {
            connect: connectFromListOfUids(coOrganizers),
          },
          bannedUsers: {
            connect: connectFromListOfUids(bannedUsers),
          },
        },
        update: {
          description,
          contactMail,
          links: { deleteMany: {}, create: links },
          beneficiary: lydiaAccountId ? { connect: { id: lydiaAccountId } } : { disconnect: true },
          location,
          title,
          visibility,
          frequency,
          recurringUntil,
          startsAt,
          endsAt,
          coOrganizers: {
            connect: connectFromListOfUids(coOrganizers),
          },
          bannedUsers: {
            connect: connectFromListOfUids(bannedUsers),
          },
          managers:
            user?.admin ||
            oldEvent?.managers.some((m) => m.userId === user?.id && m.canEditPermissions)
              ? {
                  deleteMany: { userId: { notIn: managersWithUserId.map((m) => m.userId) } },
                  upsert: managersWithUserId.map(
                    ({
                      userUid: uid,
                      userId,
                      canEdit,
                      canEditPermissions,
                      canVerifyRegistrations,
                    }) => ({
                      where: { eventId_userId: { eventId: id!, userId } },
                      create: {
                        user: { connect: { uid } },
                        canEdit,
                        canEditPermissions,
                        canVerifyRegistrations,
                      },
                      update: {
                        canEdit,
                        canEditPermissions,
                        canVerifyRegistrations,
                      },
                    }),
                  ),
                }
              : undefined,
        },
      });

      // 2. Delete tickets that are not in the list
      await prisma.ticket.deleteMany({
        where: {
          event: { id: event.id },
          id: {
            notIn: tickets.map(({ id }) => id).filter(Boolean) as string[],
          },
        },
      });

      // 3. Delete ticket groups that are not in the list
      await prisma.ticketGroup.deleteMany({
        where: {
          event: { id: event.id },
          id: {
            notIn: ticketGroups.map(({ id }) => id).filter(Boolean) as string[],
          },
        },
      });

      // 4. Upsert ticket groups, without setting tickets yet
      for (const ticketGroup of ticketGroups) {
        const newTicketGroup = await prisma.ticketGroup.upsert({
          where: { id: ticketGroup.id ?? '' },
          create: {
            ...ticketGroup,
            id: undefined,
            tickets: undefined,
            event: { connect: { id: event.id } },
          },
          update: {
            ...ticketGroup,
            id: undefined,
            tickets: undefined,
          },
        });
        ticketGroup.id = newTicketGroup.id;
      }

      // 5. Upsert tickets, setting their group
      const simppsPromotion = await prisma.promotion.findFirst({
        where: { type: PrismaTypes.PromotionType.SIMPPS, validUntil: { gte: new Date() } },
      });

      for (const ticket of tickets) {
        const ticketGroupId = ticket.groupName
          ? ticketGroups.find((tg) => tg.name === ticket.groupName)!.id
          : undefined;
        await prisma.ticket.upsert({
          where: { id: ticket.id ?? '' },
          create: {
            ...omit(ticket, ['groupName']),
            uid: await createTicketUid({
              ...ticket,
              eventId: event.id,
              ticketGroupId,
              ticketGroupName: ticket.groupName,
            }),
            id: undefined,
            group: ticketGroupId ? { connect: { id: ticketGroupId } } : undefined,
            event: { connect: { id: event.id } },
            links: { create: ticket.links },
            // connections
            openToGroups: { connect: connectFromListOfUids(ticket.openToGroups) },
            openToSchools: { connect: connectFromListOfUids(ticket.openToSchools) },
            openToMajors: { connect: connectFromListOfIds(ticket.openToMajors) },
            autojoinGroups: { connect: connectFromListOfUids(ticket.autojoinGroups) },
            // SIMPPS promotion
            subjectToPromotions:
              simppsPromotion && group.type === GroupType.StudentAssociationSection
                ? { connect: { id: simppsPromotion.id } }
                : undefined,
          },
          update: {
            ...omit(ticket, ['groupName']),
            id: undefined,
            group: ticketGroupId ? { connect: { id: ticketGroupId } } : { disconnect: true },
            links: {
              deleteMany: {},
              create: ticket.links,
            },
            // connections
            openToGroups: { set: connectFromListOfUids(ticket.openToGroups) },
            openToSchools: { set: connectFromListOfUids(ticket.openToSchools) },
            openToMajors: { set: connectFromListOfIds(ticket.openToMajors) },
            autojoinGroups: { set: connectFromListOfUids(ticket.autojoinGroups) },
            // SIMPPS promotion
            subjectToPromotions:
              simppsPromotion && group.type === GroupType.StudentAssociationSection
                ? { connect: { id: simppsPromotion.id } }
                : undefined,
          },
        });
      }

      const result = await prisma.event.findUniqueOrThrow({
        ...query,
        where: { id: event.id },
      });

      const finalEvent = await prisma.event.findUniqueOrThrow({
        where: { id: event.id },
        include: {
          tickets: true,
          group: true,
          ticketGroups: {
            include: {
              tickets: true,
            },
          },
        },
      });

      await prisma.logEntry.create({
        data: {
          area: 'event',
          action: id ? 'update' : 'create',
          target: event.id,
          message: `${id ? 'Updated' : 'Created'} event ${event.id}: ${JSON.stringify(finalEvent)}`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });

      if (shotgunChanged) await scheduleShotgunNotifications(finalEvent, { dryRun: false });

      return result;
    },
  }),
);
