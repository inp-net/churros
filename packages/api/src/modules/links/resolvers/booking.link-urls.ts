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
      return links.map((link) => {
        const rendered = renderURL(link, user, {
          code: localID(id).toUpperCase(),
        });
        return URL.canParse(rendered) ? new URL(rendered) : null;
      });
    },
  }),
);
