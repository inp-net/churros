import {
  builder,
  canCreateAppleWalletPasses,
  createAppleWalletPass,
  ensureGlobalId,
  localID,
  log,
  prisma,
  storageRoot,
} from '#lib';
import { GraphQLError } from 'graphql';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path/posix';

builder.mutationField('createAppleWalletPass', (t) =>
  t.string({
    description:
      "Crée un pass Apple Wallet pour une réservation donnée. Renvoie l'URL à utiliser pour ajouter le pass à Apple Wallet.",
    errors: {},
    args: {
      code: t.arg.string({ description: 'Code de la réservation' }),
    },
    async resolve(_, { code }, { user }) {
      if (!canCreateAppleWalletPasses())
        throw new GraphQLError("L'intégration Apple Wallet est désactivée.");

      const booking = await prisma.registration.findFirstOrThrow({
        where: {
          id: ensureGlobalId(code.toLowerCase(), 'Registration'),
        },
        include: createAppleWalletPass.prismaIncludes,
      });

      const destination = path.join('passes/apple/', `${localID(booking.id)}.pkpass`);
      await log('bookings', 'create-pass/apple', { booking, destination }, booking.id, user);
      await mkdir(path.join(storageRoot(), 'passes/apple'), {
        recursive: true,
      });
      try {
        await writeFile(
          path.join(storageRoot(), destination),
          await createAppleWalletPass(booking).then((pass) => pass.asBuffer()),
        );
        return new URL(destination, process.env.PUBLIC_STORAGE_URL).toString();
      } catch (error) {
        await log('bookings', 'create-pass/apple/error', { booking, error }, booking.id, user);
        throw new GraphQLError('Une erreur est survenue pendant la création du pass');
      }
    },
  }),
);
