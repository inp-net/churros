import { prisma } from '#lib';

import type { PushNotification } from '#modules/notifications';
import { scheduleNotification } from '#modules/notifications';
import { fullName } from '#modules/users';
import {
  NotificationChannel,
  Visibility,
  type Group,
  type GroupMember,
  type Major,
  type School,
  type Ticket,
  type User,
} from '@prisma/client';
import type Cron from 'croner';
import { format, subMinutes } from 'date-fns';

export async function scheduleShotgunNotifications(
  {
    id,
    tickets,
    notifiedAt,
  }: {
    id: string;
    tickets: Ticket[];
    notifiedAt: Date | null;
  },
  { dryRun = false }: { dryRun: boolean },
): Promise<[Cron | boolean, Cron | boolean] | undefined> {
  if (tickets.length === 0) return;
  if (notifiedAt) return;
  const soonDate = (date: Date) => subMinutes(date, 10);

  const opensAt = new Date(
    Math.min(...tickets.map(({ opensAt }) => opensAt?.valueOf() ?? Number.POSITIVE_INFINITY)),
  );

  const closesAt = new Date(
    Math.min(...tickets.map(({ closesAt }) => closesAt?.valueOf() ?? Number.POSITIVE_INFINITY)),
  );

  // All 4 notifications are sensibly the same
  const makeNotification =
    (type: 'Closing' | 'Opening') =>
    async (
      user: User & {
        major: null | (Major & { schools: School[] });
        groups: Array<GroupMember & { group: Group }>;
      },
    ) => {
      const event = await prisma.event.findUnique({
        where: {
          id,
        },
        include: {
          tickets: true,
          coOrganizers: {
            include: {
              studentAssociation: {
                include: {
                  school: true,
                },
              },
            },
          },
          group: {
            include: {
              studentAssociation: {
                include: {
                  school: true,
                },
              },
            },
          },
        },
      });

      // Don't send if event does not exist anymore
      if (!event) return;

      // Don't send if the event is not open to any school the user is in
      const schoolsOfEvent = new Set(
        [
          event.group.studentAssociation?.school,
          ...event.coOrganizers.map((c) => c.studentAssociation?.school),
        ]
          .filter(Boolean)
          .map((s) => s!.id),
      );

      // Don't send notifications for school-restricted events if the recipient is not in any of the organizing schools
      if (
        event.visibility === Visibility.SchoolRestricted &&
        !user.major?.schools.some((school) => schoolsOfEvent.has(school.id))
      )
        return;

      // Don't send notifications for unlisted or private events
      if (event.visibility === Visibility.Unlisted || event.visibility === Visibility.Private)
        return;

      // Don't send if the event is unlisted and the recipient is not in the group
      if (
        event.visibility === Visibility.GroupRestricted &&
        !user.groups.some(({ group }) => group.id === event.groupId)
      )
        return;

      // For closing notifications, don't send if the user has registered a ticket
      if (type === 'Closing') {
        const registration = await prisma.registration.findFirst({
          where: {
            ticket: {
              eventId: id,
            },
            paid: true,
            OR: [
              {
                authorId: user.id,
                beneficiary: '',
              },
              {
                beneficiary: user.uid,
              },
              {
                beneficiary: fullName(user),
              },
            ],
          },
        });
        if (registration) return;
      }

      const notification: PushNotification = {
        title: '',
        body: '',
        data: {
          group: event.group.uid,
          channel: NotificationChannel.Shotguns,
          goto: `/events/${event.group.uid}/${event.uid}`,
        },
        image: event.pictureFile,
      };

      const openedShotgunActions: PushNotification['actions'] = [
        {
          action: `/events/${event.group.uid}/${event.uid}`,
          title: 'Go !',
        },
      ];

      switch (type) {
        case 'Opening': {
          notification.title = `Shotgun pour ${event.title}`;
          notification.body = `Prépare-toi, il ouvre à ${format(opensAt, 'HH:mm')}`;
          notification.timestamp = opensAt.valueOf();
          break;
        }

        case 'Closing': {
          notification.title = `Shotgun pour ${event.title}`;
          notification.body = `Attention, il ferme à ${format(closesAt, 'HH:mm')}, dépeches-toi !`;
          notification.timestamp = closesAt.valueOf();
          notification.actions = openedShotgunActions;
          break;
        }

        default: {
          break;
        }
      }

      return {
        ...notification,
        async afterSent() {
          console.info(`[${new Date()}] Set notifiedAt on ${event.id}`);
          await prisma.event.update({
            where: { id: event.id },
            data: {
              notifiedAt: new Date(),
            },
          });
        },
      };
    };

  return [
    await scheduleNotification(makeNotification('Opening'), {
      at: soonDate(opensAt),
      eager: true,
      dryRun,
    }),
    await scheduleNotification(makeNotification('Closing'), {
      at: soonDate(closesAt),
      eager: true,
      dryRun,
    }),
  ];
}
