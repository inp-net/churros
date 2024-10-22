import { fullName } from '#modules/users';
import type { Prisma } from '@churros/db/prisma';
import { GoogleAuth } from 'google-auth-library';
import { ENV } from './env.js';
import { localID } from './global-id.js';

const baseUrl = 'https://walletobjects.googleapis.com/walletobjects/v1';

// Google Wallet does not like localhost URLs, so we replace localhost:* with churros.inpt.fr, even in dev.
function noLocalhostURL(path: string, base: string): URL {
  const result = new URL(path, base);
  if (result.hostname === 'localhost') {
    result.hostname = 'churros.inpt.fr';
    result.port = '';
  }

  return result;
}

export function makeGoogleWalletObject(
  booking: Prisma.RegistrationGetPayload<{
    include: typeof makeGoogleWalletObject.prismaIncludes;
  }>,
) {
  const event = booking.ticket.event;
  if (!event.startsAt || !event.endsAt)
    throw new Error('Event must have a start and end date to generate a google wallet object');
  return {
    id: `${GOOGLE_WALLET_CLASS.id}_${localID(booking.id)}`,
    classId: GOOGLE_WALLET_CLASS.id,
    logo: {
      sourceUri: {
        uri: noLocalhostURL('android-chrome-512x512.png', ENV.PUBLIC_FRONTEND_ORIGIN).toString(),
      },
      contentDescription: {
        defaultValue: {
          language: 'fr-FR',
          value: `Logo de Churros`,
        },
      },
    },
    cardTitle: {
      defaultValue: {
        language: 'fr-FR',
        value: 'Churros',
      },
    },
    subheader: {
      defaultValue: {
        language: 'fr-FR',
        value: event.location || 'Place pour',
      },
    },
    header: {
      defaultValue: {
        language: 'fr-FR',
        value: event.title,
      },
    },
    textModulesData: [
      {
        id: 'date',
        header: 'Date',
        body: new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(event.startsAt),
      },
      {
        id: 'time',
        header: 'Heure',
        body: new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short' }).format(event.startsAt),
      },
      {
        id: 'beneficiary',
        header: 'Place pour',
        body:
          booking.externalBeneficiary ||
          (booking.internalBeneficiary
            ? fullName(booking.internalBeneficiary)
            : fullName(
                booking.author ?? {
                  firstName: '??',
                  lastName: '??',
                },
              )),
      },
    ],
    barcode: {
      type: 'QR_CODE',
      value: booking.id,
      alternateText: localID(booking.id).toUpperCase(),
    },
    // hexBackgroundColor: event.group.color,
    hexBackgroundColor: '#ffffff',
    heroImage: {
      sourceUri: {
        uri: event.pictureFile
          ? noLocalhostURL(event.pictureFile, ENV.PUBLIC_STORAGE_URL).toString()
          : noLocalhostURL('android-chrome-512x512.png', ENV.PUBLIC_FRONTEND_ORIGIN).toString(),
      },
      contentDescription: {
        defaultValue: {
          language: 'fr-FR',
          value: "Image de l'évènement",
        },
      },
    },
  };
}

makeGoogleWalletObject.prismaIncludes = {
  author: true,
  internalBeneficiary: true,
  ticket: {
    include: {
      event: {
        include: {
          group: true,
        },
      },
    },
  },
} as const satisfies Prisma.RegistrationInclude;

export const GOOGLE_WALLET_CLASS = {
  id: `${ENV.PUBLIC_GOOGLE_WALLET_ISSUER_ID}.churros_event`,
  classTemplateInfo: {
    cardTemplateOverride: {
      cardRowTemplateInfos: [
        {
          twoItems: {
            startItem: {
              firstValue: {
                fields: [
                  {
                    fieldPath: "object.textModulesData['date']",
                  },
                ],
              },
            },
            endItem: {
              firstValue: {
                fields: [
                  {
                    fieldPath: "object.textModulesData['time']",
                  },
                ],
              },
            },
          },
        },
        {
          twoItems: {
            startItem: {
              firstValue: {
                fields: [
                  {
                    fieldPath: "object.textModulesData['beneficiary']",
                  },
                ],
              },
            },
            endItem: {
              firstValue: {
                fields: [
                  {
                    fieldPath: "object.textModulesData['ticket']",
                  },
                ],
              },
            },
          },
        },
      ],
    },
  },
};

export async function registerGoogleWalletClass(data: typeof GOOGLE_WALLET_CLASS): Promise<string> {
  if (!ENV.GOOGLE_WALLET_ISSUER_KEY) {
    console.warn(
      'No GOOGLE_WALLET_ISSUER_KEY set in environment variables, not registering Google Wallet class.',
    );
    return '';
  }
  const httpClient = new GoogleAuth({
    credentials: ENV.GOOGLE_WALLET_ISSUER_KEY,
    scopes: 'https://www.googleapis.com/auth/wallet_object.issuer',
  });
  try {
    // Check if the class exists already
    await httpClient.request({
      url: `${baseUrl}/genericClass/${data.id}`,
      method: 'GET',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.response?.status === 404) {
      // Class does not exist
      // Create it now
      await httpClient.request({
        url: `${baseUrl}/genericClass`,
        method: 'POST',
        data,
      });
    } else {
      console.error(error);
    }
  }
  return data.id;
}
