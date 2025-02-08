import { builder, isGlobalID, prisma, splitID } from '#lib';
import { DateTimeScalar } from '#modules/global';

export const LogType = builder.prismaNode('LogEntry', {
  id: { field: 'id' },
  authScopes(_, { user }) {
    return Boolean(user?.admin);
  },
  fields: (t) => ({
    happenedAt: t.expose('happenedAt', { type: DateTimeScalar }),
    user: t.relation('user', { nullable: true }),
    area: t.exposeString('area'),
    action: t.exposeString('action'),
    target: t.exposeString('target', { nullable: true }),
    message: t.exposeString('message'),
    targetObject: t.field({
      type: builder.nodeInterfaceRef(),
      nullable: true,
      resolve({ target }) {
        if (!target) return null;
        if (isGlobalID(target)) {
          const [type] = splitID(target);
          try {
            // @ts-expect-error
            return prisma[type[0].toLowerCase() + type.slice(1)].findUnique({
              where: { id: target },
            });
          } catch (error) {
            return null;
          }
        }

        return (
          prisma.user.findUnique({
            where: { uid: target },
          }) ??
          prisma.group.findUnique({
            where: { uid: target },
          }) ??
          prisma.studentAssociation.findUnique({
            where: { uid: target },
          }) ??
          prisma.school.findUnique({
            where: { uid: target },
          })
        );
      },
    }),
  }),
});
