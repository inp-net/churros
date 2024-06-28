import { fullName } from '#modules/users';
import type { Event, Group, Registration, User } from '@churros/db/prisma';
import { GoogleAuth, type JWTInput } from 'google-auth-library';
import { splitID } from './global-id.js';

const GOOGLE_WALLET_ISSUER_ID = process.env.PUBLIC_GOOGLE_WALLET_ISSUER_ID;

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
  event: Event & { group: Group },
  registration: Registration & { author: User | null },
) {
  return {
    id: `${GOOGLE_WALLET_CLASS.id}_${splitID(registration.id)[1]}`,
    classId: GOOGLE_WALLET_CLASS.id,
    logo: {
      sourceUri: {
        uri: noLocalhostURL('android-chrome-512x512.png', process.env.FRONTEND_ORIGIN).toString(),
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
          registration.beneficiary ||
          fullName(
            registration.author ?? {
              firstName: '??',
              lastName: '??',
            },
          ),
      },
    ],
    barcode: {
      type: 'QR_CODE',
      value: registration.id,
      alternateText: splitID(registration.id)[1].toUpperCase(),
    },
    // hexBackgroundColor: event.group.color,
    hexBackgroundColor: '#ffffff',
    heroImage: {
      sourceUri: {
        uri: event.pictureFile
          ? noLocalhostURL(event.pictureFile, process.env.PUBLIC_STORAGE_URL).toString()
          : noLocalhostURL('android-chrome-512x512.png', process.env.FRONTEND_ORIGIN).toString(),
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

export const GOOGLE_WALLET_CLASS = {
  id: `${GOOGLE_WALLET_ISSUER_ID}.churros_event`,
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
  let credentials: JWTInput;
  try {
    credentials = JSON.parse(process.env.GOOGLE_WALLET_ISSUER_KEY);
  } catch (error) {
    console.error(`Could not parse credentials for Google Wallet issuer service account: ${error}`);
    return '';
  }
  const httpClient = new GoogleAuth({
    credentials,
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
