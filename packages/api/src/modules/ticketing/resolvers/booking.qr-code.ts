import { builder, renderQRCode } from '#lib';

import { QRCodeType, URLScalar } from '#modules/global';
import { RegistrationType } from '#modules/ticketing/types';

builder.prismaObjectField(RegistrationType, 'qrCode', (t) =>
  t.field({
    type: QRCodeType,
    description: 'Returns an SVG path of the QR Code for the given registration',
    args: {
      url: t.arg({
        type: URLScalar,
        description:
          'URL à utiliser pour le QR Code. `[code]` sera remplacé par le code de la réservation',
      }),
    },
    authScopes() {
      return true;
    },
    resolve({ id }, { url }) {
      return renderQRCode(url.toString().replace('[code]', id));
    },
  }),
);
