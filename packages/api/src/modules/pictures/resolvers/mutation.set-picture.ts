import {
  builder,
  localID,
  prisma,
  removePicture,
  splitID,
  updatePicture,
  type Context,
} from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { FileScalar, PicturedInterface } from '#modules/global/types';
import { canEditGroup } from '#modules/groups';
import { ThemeVariantType } from '#modules/themes';
import { canEditProfile } from '#modules/users';
import { ThemeVariant } from '@churros/db/prisma';
import { queryFromInfo } from '@pothos/plugin-prisma';
import { GraphQLError } from 'graphql';
import path from 'node:path/posix';
import { ZodError } from 'zod';

builder.mutationField('setPicture', (t) =>
  t.field({
    type: PicturedInterface,
    errors: {
      types: [Error, ZodError],
      result: {
        fields: (t) => ({
          alreadyDeleted: t.string({
            description:
              "Si l'image a déjà été supprimée, renvoie un texte expliquant que l'image a déjà été supprimée. Sinon, renvoie une chaîne vide.",
            resolve: (_, __, { caveats }) => caveats[0] ?? '',
          }),
        }),
      },
    },
    args: {
      resource: t.arg.id({
        description: "Identifiant global de la resource sur laquelle on veut changer l'image",
      }),
      file: t.arg({
        type: FileScalar,
        required: false,
        description: "Le fichier de l'image. Si null, l'image sera supprimée.",
      }),
      variant: t.arg({
        type: ThemeVariantType,
        defaultValue: ThemeVariant.Light,
        description:
          "Pour quelle variante de thème changer l'image. Voir `Pictured.hasSeparateDarkPicture`.",
      }),
    },
    async authScopes(_, { resource }, { user }) {
      const [typename] = splitID(resource);
      switch (typename) {
        case 'Event': {
          const event = await prisma.event.findUniqueOrThrow({
            where: { id: resource },
            include: canEditEventPrismaIncludes,
          });
          return canEditEvent(event, user);
        }
        case 'User': {
          const targetUser = await prisma.user.findUniqueOrThrow({
            where: { id: resource },
            include: canEditProfile.prismaIncludes,
          });
          return canEditProfile(user, targetUser);
        }
        case 'Group': {
          const group = await prisma.group.findUniqueOrThrow({
            where: { id: resource },
            include: canEditGroup.prismaIncludes,
          });
          return canEditGroup(user, group);
        }
        default: {
          // TODO
          return false;
        }
      }
    },
    async resolve(_, { resource, variant, file }, context, info) {
      const [typename] = splitID(resource);
      const queryFor = <T extends string>(typeName: T) =>
        queryFromInfo({ context, info, typeName });
      switch (typename) {
        case 'Event': {
          await setPicture(file, {
            globalId: resource,
            resource: 'event',
            folder: 'events',
            ...context,
          });
          return prisma.event.findUniqueOrThrow({ ...queryFor('Event'), where: { id: resource } });
        }
        case 'User': {
          await setPicture(file, {
            globalId: resource,
            resource: 'user',
            folder: 'users',
            ...context,
          });
          return prisma.user.findUniqueOrThrow({ ...queryFor('User'), where: { id: resource } });
        }
        case 'Group': {
          await setPicture(file, {
            globalId: resource,
            resource: 'group',
            folder: path.join('groups', variant.toLowerCase()),
            ...context,
          });
          return prisma.group.findUniqueOrThrow({ ...queryFor('Group'), where: { id: resource } });
        }
        default: {
          // TODO
          throw new GraphQLError('Not implemented');
        }
      }
    },
  }),
);

async function setPicture(
  file: File | null | undefined,
  opts: {
    identifier?: string;
    globalId: string;
    resource: Parameters<typeof updatePicture>[0]['resource'] &
      Parameters<typeof removePicture>[0]['resourceType'];
    folder: string;
    extension?: Parameters<typeof updatePicture>[0]['extension'];
    user: Context['user'];
    caveats: Context['caveats'];
  },
) {
  if (file) {
    await updatePicture({
      resource: opts.resource,
      folder: opts.folder,
      extension: opts.extension ?? 'png',
      file,
      identifier: opts.identifier ?? localID(opts.globalId),
    });
  } else {
    const { alreadyDeleted } = await removePicture({
      user: opts.user,
      resourceId: opts.globalId,
      resourceType: opts.resource,
    });
    if (alreadyDeleted) opts.caveats.unshift("L'image a déjà été supprimée");
  }
}
