import { builder, ensureGlobalId, ENV, makeGoogleWalletObject, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';

const issuer = ENV.GOOGLE_WALLET_ISSUER_KEY;

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

      if (!issuer) throw new GraphQLError("L'intégration Google Wallet est désactivée.");

      const claims = {
        iss: issuer.client_email,
        aud: 'google',
        origins: [],
        typ: 'savetowallet',
        payload: {
          genericObjects: [makeGoogleWalletObject(booking)],
        },
      };

      const token = jwt.sign(claims, issuer.private_key, { algorithm: 'RS256' });
      return `https://pay.google.com/gp/v/save/${token}`;
    },
  }),
);
