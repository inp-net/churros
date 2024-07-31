import { builder, ensureGlobalId, log, prisma } from '#lib';
import { DateTimeScalar, LocalID, UIDScalar } from '#modules/global';
import { ThemeType } from '#modules/themes/types';
import { canCreateThemes, canEditTheme } from '#modules/themes/utils';
import { ZodError } from 'zod';

builder.mutationField('upsertTheme', (t) =>
  t.prismaField({
    type: ThemeType,
    errors: { types: [ZodError, Error] },
    description: 'Créer ou modifier un thème',
    args: {
      id: t.arg({ type: LocalID, required: false }),
      name: t.arg.string({ validate: { minLength: 3, maxLength: 100 } }),
      group: t.arg({ type: UIDScalar }),
      startsAt: t.arg({ type: DateTimeScalar, required: true }),
      endsAt: t.arg({ type: DateTimeScalar, required: true }),
      autodeploy: t.arg.boolean({ required: true }),
    },
    async authScopes(_, { group, id }, { user }) {
      const newGroup = await prisma.group.findUniqueOrThrow({ where: { uid: group } });
      if (id) {
        const theme = await prisma.theme.findUniqueOrThrow({
          where: { id },
          include: { author: true },
        });
        return canEditTheme(user, theme) && canCreateThemes(user, newGroup);
      }
      return canCreateThemes(user, newGroup);
    },
    async resolve(query, _, { name, group, startsAt, endsAt, id, autodeploy }, { user }) {
      id = id ? ensureGlobalId(id, 'Theme') : undefined;
      await log(
        'themes',
        'create',
        { name, group, startsAt, endsAt, id, autodeploy },
        undefined,
        user,
      );
      const data = {
        name,
        author: {
          connect: {
            uid: group,
          },
        },
        startsAt,
        endsAt,
        autodeploy,
      };
      if (id) return prisma.theme.update({ ...query, where: { id }, data });
      return prisma.theme.create({ ...query, data });
    },
  }),
);
