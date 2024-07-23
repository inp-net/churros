import { builder, ensureGlobalId, prisma } from '#lib';
import { LocalID, UIDScalar } from '#modules/global';
import { userCanAccessEvent } from '#permissions';
import { GraphQLError } from 'graphql';
import { EventType } from '../index.js';

builder.queryField('event', (t) =>
  t.prismaField({
    type: EventType,
    args: {
      group: t.arg({ type: UIDScalar, required: false }),
      slug: t.arg.string({ required: false }),
      id: t.arg({ type: LocalID, required: false }),
    },
    validate: [
      [
        ({ group, slug, id }) => Boolean(id || (group && slug)),
        {
          message: "Préciser l'identifiant ou le groupe et le slug de l'événement",
        },
      ],
    ],
    smartSubscription: true,
    async authScopes(_, { id, group, slug }, { user }) {
      if (!id) {
        const event = await prisma.event.findFirst({
          where: { slug: slug!, group: { uid: group! } },
          select: { id: true },
        });
        if (event) id = event.id;
      }

      if (!id) throw new GraphQLError('Événement non trouvé');

      const event = await prisma.event.findUnique({
        where: { id: ensureGlobalId(id, 'Event') },
        include: {
          coOrganizers: { include: { studentAssociation: { include: { school: true } } } },
          group: { include: { studentAssociation: { include: { school: true } } } },
          managers: { include: { user: true } },
          tickets: true,
        },
      });
      return userCanAccessEvent(event, user);
    },
    async resolve(query, _, { slug, group, id }) {
      if (!id) {
        const event = await prisma.event.findFirst({
          where: { slug: slug!, group: { uid: group! } },
          select: { id: true },
        });
        if (event) id = event.id;
      }

      if (!id) throw new GraphQLError('Événement non trouvé');

      return prisma.event.findUniqueOrThrow({
        ...query,
        where: { id: ensureGlobalId(id, 'Event') },
      });
    },
  }),
);
