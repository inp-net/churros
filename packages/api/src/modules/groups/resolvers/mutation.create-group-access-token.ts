import { builder, log, prisma } from '#lib';
import { UIDScalar } from '#modules/global';
import { canCreateGroupAccessToken } from '#modules/groups/utils';
import { CredentialType } from '#modules/users';
import { CredentialType as PrismaCredentialType } from '@churros/db/prisma';
import { nanoid } from 'nanoid';

builder.mutationField('createGroupAccessToken', (t) =>
  t.prismaField({
    type: CredentialType,
    errors: {
      dataField: {
        grantScopes: ['login'],
      },
    },
    description:
      "Créer un token d'accès pour un groupe. Les requêtes effectuées avec ce token auront des permissions différentes, et permettent d'effectuer certaines actions en tant qu'un groupe au lieu d'une personne",
    args: {
      group: t.arg({
        type: UIDScalar,
      }),
    },
    async authScopes(_, args, { user }) {
      return canCreateGroupAccessToken(
        user,
        await prisma.group.findUniqueOrThrow({ where: { uid: args.group } }),
      );
    },
    async resolve(query, _, { group }, { user }) {
      await log('groups', 'create-group-access-token', { group }, group, user);
      return prisma.credential.create({
        ...query,
        data: {
          type: PrismaCredentialType.GroupAccessToken,
          value: nanoid(32),
          group: {
            connect: {
              uid: group,
            },
          },
        },
      });
    },
  }),
);
