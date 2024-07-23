import { builder, log, prisma, UnauthorizedError } from '#lib';
import { PageType } from '#modules/pages/types';
import { canEditPage } from '#modules/pages/utils';
import type { InputFieldRef, InputShapeFromFields, SchemaTypes } from '@pothos/core';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

builder.mutationField('deletePage', (t) =>
  t.prismaField({
    type: PageType,
    errors: { types: [Error, ZodError] },
    description:
      "Supprime une page existante. On peut renseigner l'identifiant de la page ou son chemin ainsi que son groupe ou AE d'appartenance.",
    args: {
      id: t.arg.id({ description: "L'identifiant de la page à supprimer", required: false }),
      path: t.arg.string({ description: 'Le chemin de la page à supprimer', required: false }),
      group: t.arg.string({
        description: "L'UID du groupe auquel la page appartient",
        required: false,
      }),
      studentAssociation: t.arg.string({
        description: "L'UID de l'AE à laquelle la page appartient",
        required: false,
      }),
    },
    validate: [
      [
        ({ path, id, group, studentAssociation }) =>
          Boolean(id || (path && (group || studentAssociation))),
        {
          message:
            "Il faut renseigner soit l'identifiant de la page, soit son chemin avec son groupe ou AE d'appartenance.",
        },
      ],
    ],
    async authScopes(_, args, { user }) {
      const existingPage = await prisma.page.findFirst({
        where: prismaWhereClause(args),
        include: {
          group: true,
          studentAssociation: true,
        },
      });

      return Boolean(existingPage && canEditPage(existingPage, user));
    },
    async resolve(query, _, args, { user }) {
      if (!user) throw new UnauthorizedError();
      const { id } = await prisma.page
        .findFirstOrThrow({
          where: prismaWhereClause(args),
          include: {
            group: true,
            studentAssociation: true,
          },
        })
        .catch(() => {
          throw new GraphQLError('Page introuvable');
        });

      const result = await prisma.page.delete({
        ...query,
        where: { id },
        include: {
          group: true,
          studentAssociation: true,
        },
      });
      await log('pages', 'delete', { args, result }, result.id, user);
      return result;
    },
  }),
);

function prismaWhereClause({
  path,
  group,
  studentAssociation,
  id,
}: InputShapeFromFields<{
  path: InputFieldRef<SchemaTypes, string | null | undefined>;
  group: InputFieldRef<SchemaTypes, string | null | undefined>;
  studentAssociation: InputFieldRef<SchemaTypes, string | null | undefined>;
  id: InputFieldRef<SchemaTypes, string | null | undefined>;
}>):
  | { path: string; group: { uid: string } }
  | { path: string; studentAssociation: { uid: string } }
  | { id: string } {
  return path && (group || studentAssociation)
    ? {
        ...(group
          ? { group: { uid: group } }
          : {
              studentAssociation: { uid: studentAssociation! },
            }),
        path,
      }
    : { id: id! };
}
