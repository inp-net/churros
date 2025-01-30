import { builder, localID, prisma } from '#lib';
import { URLScalar } from '#modules/global';
import { RegistrationType } from '#modules/ticketing';
import { renderURL } from '../utils/index.js';

builder.prismaObjectField(RegistrationType, 'linkURLs', (t) =>
  t.field({
    type: [URLScalar],
    description:
      "Liens associés au billets, avec `[code]` remplacé par la valeur de la variable `code` passée dans l'opération",
    async resolve({ ticketId, id }, _, { user }) {
      const links = await prisma.link.findMany({
        where: { ticketId },
      });
      return links
        .map(({ value }) =>
          renderURL(value, user, {
            code: localID(id).toUpperCase(),
          }),
        )
        .filter((link) => URL.canParse(link))
        .map((link) => new URL(link));
    },
  }),
);
