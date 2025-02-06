import { builder, prisma } from '#lib';
import { RegistrationType } from '#modules/ticketing';

builder.prismaObjectField(RegistrationType, 'linkNames', (t) =>
  t.field({
    type: ['String'],
    description: 'Nom des liens du billet. Dans le même ordre que `links`.',
    async resolve({ ticketId }) {
      const links = await prisma.link.findMany({
        where: { ticketId },
      });
      return links.map((link) => link.name);
    },
  }),
);
