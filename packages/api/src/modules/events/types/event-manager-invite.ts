import { builder, CapacityUnlimitedValue, prisma, renderQRCode } from '#lib';
import { CapacityScalar, EventManagerPowerLevelType } from '#modules/events';
import {
  canSeeEventManagerInvites,
  eventManagerInviteExpirationDate,
  eventManagerInviteHasNoUsesLeft,
  eventManagerInviteUsesLeft,
  isEventManagerInviteExpired,
  permissionsToPowerlevel,
} from '#modules/events/utils';
import { DateTimeScalar, QRCodeType, URLScalar } from '#modules/global';
import type { Prisma } from '@churros/db/prisma';
import { EventManagerPowerLevel } from './event-manager-power-level.js';

export const DEFAULT_EVENT_MANAGER_INVITE_CAPACITY = 30;
export const DEFAULT_EVENT_MANAGER_INVITE_POWERLEVEL = EventManagerPowerLevel.ScanTickets;

export const EventManagerInviteTypePrismaIncludes = {
  event: {
    include: canSeeEventManagerInvites.prismaIncludes,
  },
} as const satisfies Prisma.EventManagerInviteInclude;

export const EventManagerInviteType = builder.prismaNode('EventManagerInvite', {
  description: 'Invitations pour ajouter facilement des managers à un évènement',
  include: EventManagerInviteTypePrismaIncludes,
  id: { field: 'id' },
  fields: (t) => ({
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    capacity: t.field({
      type: CapacityScalar,
      description: "Limite sur le nombre de personnes pouvant utiliser l'invitation",
      resolve({ capacity }) {
        return capacity ?? CapacityUnlimitedValue;
      },
    }),
    code: t.string({
      nullable: true,
      resolve({ event, code }, {}, { user }) {
        return canSeeEventManagerInvites(event, user) ? code : null;
      },
    }),
    qrcode: t.field({
      type: QRCodeType,
      description: "Path SVG du QR Code pour utiliser l'invation",
      args: {
        url: t.arg({
          type: URLScalar,
          description:
            "URL à utiliser pour le QR Code. `[code]` sera remplacé par le code d'invitation",
        }),
      },
      authScopes({ event }, {}, { user }) {
        return canSeeEventManagerInvites(event, user);
      },
      resolve({ code }, { url }) {
        return renderQRCode(url.toString().replace('[code]', code));
      },
    }),
    expiresAt: t.field({
      type: DateTimeScalar,
      description:
        "Date à partir de laquelle l'invitation n'est plus valide. Si null, la date de fin de l'évènement est utilisée",
      nullable: true,
      args: {
        definitive: t.arg.boolean({
          defaultValue: false,
          description:
            "Renvoyer la date d'expiration réelle (donc date de fin de l'évènement si expiresAt est null).",
        }),
      },
      resolve({ expiresAt, event }, { definitive }) {
        return definitive ? eventManagerInviteExpirationDate({ expiresAt, event }) : expiresAt;
      },
    }),
    usedBy: t.relatedConnection('usedBy', {
      cursor: 'id',
      async authScopes({ eventId }, {}, { user }) {
        const event = await prisma.event.findUniqueOrThrow({
          where: { id: eventId },
          include: canSeeEventManagerInvites.prismaIncludes,
        });
        return canSeeEventManagerInvites(event, user);
      },
    }),
    uses: t.relationCount('usedBy', {
      description: "Nombre de personnes ayant utilisé l'invitation",
    }),
    usesLeft: t.field({
      description: "Nombre d'utilisations restantes pour l'invitation",
      type: CapacityScalar,
      async resolve({ id, capacity }) {
        return await eventManagerInviteUsesLeft({ id, capacity });
      },
    }),
    expired: t.boolean({
      description: "L'invitation est expiré",
      resolve(invite) {
        return isEventManagerInviteExpired(invite);
      },
    }),
    unusable: t.boolean({
      description: "L'invitation est expiré ou a atteint sa limite de nombre d'utilisations",
      async resolve(invite) {
        if (isEventManagerInviteExpired(invite)) return true;
        return await eventManagerInviteHasNoUsesLeft(invite);
      },
    }),
    power: t.field({
      type: EventManagerPowerLevelType,
      description: "Niveau de permissions que l'invitation donne",
      resolve(invite) {
        return permissionsToPowerlevel(invite);
      },
    }),
  }),
});
