import { builder, splitID } from '#lib';
import type { Reaction } from '@churros/db/prisma';

interface Reactable {
  reactions: Array<Reaction>;
  id: string;
}

export const ReactableInterface = builder.interfaceRef<Reactable>('Reactable').implement({
  name: 'Reactable',
  description: 'Une resource pouvant recevoir des réactions (likes, etc) par les utilisateur·ice·s',
  resolveType({ id }) {
    const [typename] = splitID(id);
    return typename;
  },
  fields: (t) => ({
    id: t.exposeID('id', { description: 'L’identifiant de la resource' }),
    reacted: t.boolean({
      args: { emoji: t.arg.string() },
      description: 'Vrai si l’utilisateur·ice connecté·e a réagi avec cet emoji',
      resolve: ({ reactions }, { emoji }, { user }) => {
        if (!user) return false;
        return reactions.some((r) => r.emoji === emoji && r.authorId === user.id);
      },
    }),
    reactions: t.int({
      args: { emoji: t.arg.string() },
      description: 'Nombre total de réactions avec cet emoji',
      resolve: ({ reactions }, { emoji }) => reactions.filter((r) => r.emoji === emoji).length,
    }),
  }),
});
