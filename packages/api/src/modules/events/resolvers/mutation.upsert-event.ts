import { builder, prisma } from '#lib';
import { DateTimeScalar, VisibilityEnum } from '#modules/global';
import { LinkInput } from '#modules/links';
import { TicketGroupInput, TicketInput, createTicketUid } from '#modules/ticketing';
import * as PrismaTypes from '@prisma/client';
import { EventFrequency, GroupType } from '@prisma/client';
import { isBefore } from 'date-fns';
import { GraphQLError } from 'graphql';
import omit from 'lodash.omit';
import {
  EventFrequencyType,
  EventType,
  ManagerOfEventInput,
  canCreateEvent,
  canEdit,
  createUid,
  scheduleShotgunNotifications,
} from '../index.js';

builder.mutationField('upsertEvent', (t) =>
  t.prismaField({
    type: EventType,
    errors: {},
    args: {
      id: t.arg.string({ required: false }),
      input: t.arg({ type: EventInput }),
    },
    async authScopes(_, { id, input: { group: groupUid } }, { user }) {
      const creating = !id;

      if (creating) {
        const group = await prisma.group.findUniqueOrThrow({ where: { uid: groupUid } });
        return canCreateEvent(group, user);
      }

      const event = await prisma.event.findUniqueOrThrow({
        where: { id },
        include: { managers: true },
      });
      return canEdit(event, user);
    },
    async resolve(
      query,
      _,
      {
        id,
        input: {
          lydiaAccountId,
          startsAt,
          endsAt,
          description,
          group: groupUid,
          contactMail,
          links,
          location,
          title,
          visibility,
          frequency,
          coOrganizers,
          bannedUsers,
          recurringUntil,
          draftStep,
          showPlacesLeft,
        },
      },
      { user },
    ) {
      // TODO send only notifications to people that have canSeeTicket(..., people)  on tickets that changed the shotgun date, and say that the shotgun date changed in the notification
      const shotgunChanged = !id;

      const connectFromListOfUids = (uids: string[]) => uids.map((uid) => ({ uid }));

      const oldEvent = id
        ? await prisma.event.findUnique({ where: { id }, include: { managers: true } })
        : undefined;

      if (id && !oldEvent) throw new Error(`Event ${id} does not exist`);

      const group = await prisma.group.findUnique({ where: { uid: groupUid } });
      if (!group) throw new Error(`Group ${groupUid} does not exist`);

      const event = await prisma.event.upsert({
        ...query,
        where: { id: id ?? '' },
        create: {
          uid: await createUid({ title, groupId: group.id }),
          group: { connect: { uid: groupUid } },
          description,
          contactMail: contactMail ?? group.email,
          links: { create: links.filter(Boolean) },
          beneficiary: lydiaAccountId ? { connect: { id: lydiaAccountId } } : undefined,
          location,
          title,
          visibility,
          frequency,
          recurringUntil,
          startsAt,
          endsAt,
          showPlacesLeft,
          draftStep,
          coOrganizers: {
            connect: connectFromListOfUids(coOrganizers ?? []),
          },
          bannedUsers: {
            connect: connectFromListOfUids(bannedUsers ?? []),
          },
          managers: {
            create: [
              {
                user: { connect: { id: user!.id } },
                canEdit: true,
                canEditPermissions: true,
                canVerifyRegistrations: true,
              },
            ],
          },
        },
        update: {
          description,
          contactMail: contactMail ?? group.email,
          links: { deleteMany: {}, create: links.filter(Boolean) },
          beneficiary: lydiaAccountId ? { connect: { id: lydiaAccountId } } : undefined,
          location: location,
          title,
          visibility,
          frequency,
          recurringUntil,
          startsAt,
          endsAt,
          showPlacesLeft,
          draftStep,
          coOrganizers: {
            connect: connectFromListOfUids(coOrganizers ?? []),
          },
          bannedUsers: {
            connect: connectFromListOfUids(bannedUsers ?? []),
          },
        },
      });

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

      const visibilityChanged = oldEvent?.visibility !== finalEvent.visibility;

      if (shotgunChanged || visibilityChanged)
        await scheduleShotgunNotifications(finalEvent, { dryRun: false });

      return result;
    },
  }),
);
