import { builder, log, prisma, splitID, storageRoot, updatePicture } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { FileScalar, PicturedInterface } from '#modules/global/types';
import { ThemeVariantType } from '#modules/themes';
import { ThemeVariant } from '@churros/db/prisma';
import { queryFromInfo } from '@pothos/plugin-prisma';
import { GraphQLError } from 'graphql';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
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
        default: {
          // TODO
          return false;
        }
      }
    },
    async resolve(_, { resource, file }, context, info) {
      const { user } = context;
      const [typename, localid] = splitID(resource);
      const queryFor = <T extends string>(typeName: T) =>
        queryFromInfo({ context, info, typeName });
      switch (typename) {
        case 'Event': {
          if (file) {
            await updatePicture({
              resource: 'event',
              folder: 'events',
              extension: 'jpg',
              file,
              identifier: localid,
            });
          } else {
            await log('events', 'delete-picture', {}, resource, user);
            const { pictureFile } = await prisma.event.findUniqueOrThrow({
              where: { id: resource },
              select: { pictureFile: true },
            });
            if (pictureFile) {
              const root = storageRoot();
              await unlink(path.join(root, pictureFile));
              return prisma.event.update({
                ...queryFor('Event'),
                where: { id: resource },
                data: { pictureFile: '' },
              });
            } else {
              context.caveats.push("L'image a déjà été supprimée");
              return prisma.event.findUniqueOrThrow({
                ...queryFor('Event'),
                where: { id: resource },
              });
            }
          }
          return prisma.event.findUniqueOrThrow({ ...queryFor('Event'), where: { id: resource } });
        }
        default: {
          // TODO
          throw new GraphQLError('Not implemented');
        }
      }
    },
  }),
);
