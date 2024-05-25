import { builder, makeGlobalID, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';

builder.mutationField('createGoogleWalletPass', (t) =>
  t.string({
    description: `Créer un pass Google Wallet pour une réservation donnée. Renvoie l'URL a utiliser pour ajouter le pass à Google Wallet.`,
    args: {
      code: t.arg.string({ description: 'Code de la réservation' }),
    },
    async resolve(_, { code }) {
      const booking = await prisma.registration.findUnique({
        where: {
          id: makeGlobalID('Registration', code.toLowerCase()),
        },
      });
      if (!booking) throw new GraphQLError('Réservation introuvable');

      const credentials = JSON.parse(process.env.GOOGLE_WALLET_ISSUER_KEY);
      const issuerId = process.env.PUBLIC_GOOGLE_WALLET_ISSUER_ID;
      const objectSuffix = `${code.replaceAll(/[^\w.-]/g, '_')}`;
      const objectId = `${issuerId}.${objectSuffix}`;
      const classId = `${issuerId}.churros_generic`;

      const genericObject = {
        id: `${objectId}`,
        classId: classId,
        genericType: 'GENERIC_TYPE_UNSPECIFIED',
        hexBackgroundColor: '#4285f4',
        logo: {
          sourceUri: {
            uri: 'https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/pass_google_logo.jpg',
          },
        },
        cardTitle: {
          defaultValue: {
            language: 'en',
            value: "Google I/O '22",
          },
        },
        subheader: {
          defaultValue: {
            language: 'en',
            value: 'Attendee',
          },
        },
        header: {
          defaultValue: {
            language: 'en',
            value: 'Alex McJacobs',
          },
        },
        barcode: {
          type: 'QR_CODE',
          value: `${objectId}`,
        },
        heroImage: {
          sourceUri: {
            uri: 'https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/google-io-hero-demo-only.jpg',
          },
        },
        textModulesData: [
          //   {
          //     header: 'POINTS',
          //     body: '1234',
          //     id: 'points',
          //   },
          //   {
          //     header: 'CONTACTS',
          //     body: '20',
          //     id: 'contacts',
          //   },
        ],
      };

      const claims = {
        iss: credentials.client_email,
        aud: 'google',
        origins: [],
        typ: 'savetowallet',
        payload: {
          genericObjects: [genericObject],
        },
      };

      const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' });
      return `https://pay.google.com/gp/v/save/${token}`;
    },
  }),
);
