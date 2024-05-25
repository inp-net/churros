import { auth } from 'google-auth-library';

const GOOGLE_WALLET_ISSUER_ID = process.env.PUBLIC_GOOGLE_WALLET_ISSUER_ID;
export const GOOGLE_WALLET_CLASS_ID = `${GOOGLE_WALLET_ISSUER_ID}.churros_generic`;

const baseUrl = 'https://walletobjects.googleapis.com/walletobjects/v1';
export const genericClass = {
  id: GOOGLE_WALLET_CLASS_ID,
  classTemplateInfo: {
    cardTemplateOverride: {
      cardRowTemplateInfos: [
        {
          twoItems: {
            startItem: {
              firstValue: {
                fields: [
                  {
                    fieldPath: 'object.textModulesData["points"]',
                  },
                ],
              },
            },
            endItem: {
              firstValue: {
                fields: [
                  {
                    fieldPath: 'object.textModulesData["contacts"]',
                  },
                ],
              },
            },
          },
        },
      ],
    },
    detailsTemplateOverride: {
      detailsItemInfos: [
        {
          item: {
            firstValue: {
              fields: [
                {
                  fieldPath: 'class.imageModulesData["event_banner"]',
                },
              ],
            },
          },
        },
        {
          item: {
            firstValue: {
              fields: [
                {
                  fieldPath: 'class.textModulesData["game_overview"]',
                },
              ],
            },
          },
        },
        {
          item: {
            firstValue: {
              fields: [
                {
                  fieldPath: 'class.linksModuleData.uris["official_site"]',
                },
              ],
            },
          },
        },
      ],
    },
  },
  imageModulesData: [
    {
      mainImage: {
        sourceUri: {
          uri: 'https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/google-io-2021-card.png',
        },
        contentDescription: {
          defaultValue: {
            language: 'en-US',
            value: 'Google I/O 2022 Banner',
          },
        },
      },
      id: 'event_banner',
    },
  ],
  textModulesData: [
    {
      header: 'Gather points meeting new people at Google I/O',
      body: 'Join the game and accumulate points in this badge by meeting other attendees in the event.',
      id: 'game_overview',
    },
  ],
  linksModuleData: {
    uris: [
      {
        uri: 'https://io.google/2022/',
        description: "Official I/O '22 Site",
        id: 'official_site',
      },
    ],
  },
};

const credentials = JSON.parse(process.env.GOOGLE_WALLET_ISSUER_KEY);

export async function registerGoogleWalletClass(data: typeof genericClass): Promise<string> {
  const httpClient = auth.fromJSON(credentials);
  httpClient.scopes = 'https://www.googleapis.com/auth/wallet_object.issuer';
  try {
    // Check if the class exists already
    await httpClient.request({
      url: `${baseUrl}/genericClass/${data.id}`,
      method: 'GET',
    });
  } catch (error) {
    if (error?.response?.status === 404) {
      // Class does not exist
      // Create it now
      await httpClient.request({
        url: `${baseUrl}/genericClass`,
        method: 'POST',
        data: genericClass,
      });
    } else {
      console.error(error);
    }
  }
  return data.id;
}
