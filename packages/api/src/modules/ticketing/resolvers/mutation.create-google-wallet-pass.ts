import { builder, ensureGlobalId, makeGoogleWalletObject, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';

builder.mutationField('createGoogleWalletPass', (t) =>
  t.string({
    description: `Créer un pass Google Wallet pour une réservation donnée. Renvoie l'URL a utiliser pour ajouter le pass à Google Wallet.`,
    args: {
      code: t.arg.string({ description: 'Code de la réservation' }),
    },
    errors: { types: [Error, ZodError] },
    async resolve(_, { code }) {
      const booking = await prisma.registration.findUnique({
        where: {
          id: ensureGlobalId(code.toLowerCase(), 'Registration'),
        },
        include: makeGoogleWalletObject.prismaIncludes,
      });
      if (!booking) throw new GraphQLError('Réservation introuvable');

      const credentials = JSON.parse(process.env.GOOGLE_WALLET_ISSUER_KEY);

      const claims = {
        iss: credentials.client_email,
        aud: 'google',
        origins: [],
        typ: 'savetowallet',
        payload: {
          genericObjects: [makeGoogleWalletObject(booking)],
        },
      };

      const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' });
      return `https://pay.google.com/gp/v/save/${token}`;
    },
  }),
);
