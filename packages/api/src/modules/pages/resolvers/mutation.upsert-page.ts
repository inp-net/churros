import { builder, log, prisma, UnauthorizedError } from '#lib';
import { GroupType } from '#modules/groups';
import { PageType } from '#modules/pages/types';
import { canEditPage, withoutTrailingSlash } from '#modules/pages/utils';
import { StudentAssociationType } from '#modules/student-associations';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';
import { canEditGroupPages, canEditStudentAssociationPages } from '../utils/permissions.js';

builder.prismaObjectField(GroupType, 'canEditPages', (t) =>
  t.boolean({
    description: "L'utilisateur·ice connecté·e peut éditer (créer ou modifier) les pages du groupe",
    resolve: (group, _, { user }) => canEditGroupPages(user, group),
  }),
);

builder.prismaObjectField(StudentAssociationType, 'canEditPages', (t) =>
  t.boolean({
    description: "L'utilisateur·ice connecté·e peut éditer (créer ou modifier) les pages de l'AE",
    resolve: ({ id }, _, { user }) => canEditStudentAssociationPages(user, id),
  }),
);

builder.prismaObjectField(PageType, 'canBeEdited', (t) =>
  t.boolean({
    description: "L'utilisateur·ice connecté·e peut modifier ou supprimer cette page",
    resolve: (page, _, { user }) => canEditPage(page, user),
  }),
);

builder.mutationField('upsertPage', (t) =>
  t.prismaField({
    type: PageType,
    errors: {
      types: [Error, ZodError],
    },
    description: 'Crée ou met à jour une page.',
    args: {
      path: t.arg.string({
        description:
          'Le chemin de la page. Si la page existe déjà, elle sera mise à jour. Sinon, une nouvelle page sera créée. Ne peut contenir que des caractères alphanumériques, des tirets, des tirets du bas et des slashes. Fait pour être utilisé dans des URLs.',
        validate: {
          regex: [
            /^[\w/-]+$/,
            {
              message:
                'Ne peut contenir que des caractères alphanumériques, des tirets, des tirets du bas et des slashes.',
            },
          ],
          minLength: 1,
          maxLength: 255,
        },
      }),
      title: t.arg.string({
        description: 'Le titre de la page',
        validate: { minLength: 1, maxLength: 255 },
      }),
      body: t.arg.string({
        description: 'Le corps de la page. Supporte le markdown',
      }),
      group: t.arg.string({
        required: false,
        description: "L'UID du groupe auquel la page appartient",
      }),
      studentAssociation: t.arg.string({
        required: false,
        description: "L'UID de l'AE à laquelle la page appartient",
      }),
    },
    validate: [
      [
        ({ group, studentAssociation }) => Boolean(group || studentAssociation),
        {
          message:
            'Vous devez spécifier un groupe ou une association étudiante à laquelle appartient la page.',
        },
      ],
    ],
    async authScopes(_, { group, studentAssociation, path }, { user }) {
      const existingPage = await prisma.page.findFirst({
        where: {
          ...(group
            ? { group: { uid: group } }
            : {
                // studentAssociation! is safe because of the validator above
                studentAssociation: { uid: studentAssociation! },
              }),
          path,
        },
        include: {
          group: true,
          studentAssociation: true,
        },
      });

      if (existingPage && !canEditPage(existingPage, user)) return false;

      return canEditPage(
        {
          group: group ? await prisma.group.findUnique({ where: { uid: group } }) : null,
          studentAssociation: studentAssociation
            ? await prisma.studentAssociation.findUnique({ where: { uid: studentAssociation } })
            : null,
        },
        user,
      );
    },
    async resolve(query, _, input, { user }) {
      if (!user) throw new UnauthorizedError();

      const group = input.group
        ? await prisma.group.findUnique({ where: { uid: input.group } })
        : null;
      const studentAssociation = input.studentAssociation
        ? await prisma.studentAssociation.findUnique({
            where: { uid: input.studentAssociation },
          })
        : null;

      if (!studentAssociation && !group)
        throw new GraphQLError('Groupe ou association étudiante introuvable.');

      const prismaData = {
        ...input,
        path: withoutTrailingSlash(input.path),
        title: input.title.trim(),
        group: group ? { connect: { id: group.id } } : undefined,
        studentAssociation: studentAssociation
          ? { connect: { id: studentAssociation.id } }
          : undefined,
        lastAuthor: { connect: { id: user.id } },
      };

      const result = await prisma.page.upsert({
        ...query,
        where: group
          ? {
              groupId_path: {
                groupId: group.id,
                path: withoutTrailingSlash(input.path),
              },
            }
          : {
              studentAssociationId_path: {
                // if check above ensures that, if group is falsy, studentAssociation exists
                studentAssociationId: studentAssociation!.id,
                path: withoutTrailingSlash(input.path),
              },
            },
        create: prismaData,
        update: {
          ...prismaData,
          ...(input.group ? {} : { group: { disconnect: true } }),
          ...(input.studentAssociation ? {} : { studentAssociation: { disconnect: true } }),
        },
      });

      await log('pages', 'upsert', { input, result }, result.id, user);
      return result;
    },
  }),
);
