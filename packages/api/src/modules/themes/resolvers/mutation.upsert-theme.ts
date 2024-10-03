import { builder, ensureGlobalId, log, prisma } from '#lib';
import { DateTimeScalar, LocalID, UIDScalar } from '#modules/global';
import { ThemeType } from '#modules/themes/types';
import { canCreateThemes, canEditTheme } from '#modules/themes/utils';
import type { Prisma } from '@churros/db/prisma';
import { ZodError } from 'zod';
import { DEFAULT_THEME_VALUES_FLAT } from '../utils/defaults.js';

builder.mutationField('upsertTheme', (t) =>
  t.prismaField({
    type: ThemeType,
    errors: { types: [ZodError, Error] },
    description: 'Créer ou modifier un thème',
    args: {
      id: t.arg({ type: LocalID, required: false }),
      name: t.arg.string({ validate: { maxLength: 100 } }),
      group: t.arg({ type: UIDScalar }),
      startsAt: t.arg({ type: DateTimeScalar, required: false }),
      endsAt: t.arg({ type: DateTimeScalar, required: false }),
      autodeploy: t.arg.boolean({ required: false }),
      prefill: t.arg.boolean({
        defaultValue: false,
        description:
          'Quand on crée un nouveau thème, remplir toutes les variables avec des valeurs par défaut',
      }),
    },
    async authScopes(_, { group, id }, { user }) {
      const newGroup = await prisma.group.findUniqueOrThrow({ where: { uid: group } });
      if (id) {
        const theme = await prisma.theme.findUniqueOrThrow({
          where: { id: ensureGlobalId(id, 'Theme') },
          include: { author: true },
        });
        return canEditTheme(user, theme) && canCreateThemes(user, newGroup);
      }
      return canCreateThemes(user, newGroup);
    },
    async resolve(query, _, { name, group, startsAt, endsAt, id, autodeploy, prefill }, { user }) {
      id = id ? ensureGlobalId(id, 'Theme') : undefined;
      await log(
        'themes',
        id ? 'update' : 'create',
        { name, group, startsAt, endsAt, id, autodeploy },
        undefined,
        user,
      );
      const data: Prisma.ThemeCreateInput & Prisma.ThemeUpdateInput = {
        name,
        author: {
          connect: {
            uid: group,
          },
        },
        startsAt,
        endsAt,
        autodeploy: autodeploy ?? undefined,
      };
      if (id) return prisma.theme.update({ ...query, where: { id }, data });

      if (prefill)
        data.values = { createMany: { skipDuplicates: true, data: DEFAULT_THEME_VALUES_FLAT } };

      return prisma.theme.create({ ...query, data });
    },
  }),
);
