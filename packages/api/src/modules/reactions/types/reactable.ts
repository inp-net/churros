import { builder, splitID } from '#lib';

interface Reactable {
  reacted: boolean;
  reactions: number;
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
    reacted: t.exposeBoolean('reacted', {
      args: { emoji: t.arg.string() },
      description: 'Vrai si l’utilisateur·ice connecté·e a réagi avec cet emoji',
    }),
    reactions: t.exposeInt('reactions', {
      args: { emoji: t.arg.string() },
      description: 'Nombre total de réactions avec cet emoji',
    }),
  }),
});
