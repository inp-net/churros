import { builder } from '#lib';

import { QRCodeType, URLScalar } from '#modules/global';
import { RegistrationType } from '#modules/ticketing/types';
import * as qrcode from 'qr-code-generator-lib';

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
      const { d: path, dim } = qrcode.renderPath(
        qrcode.getMatrix(url.toString().replace('[code]', id)),
      );
      const builtinPadding = 4;
      const viewbox = `${builtinPadding} ${builtinPadding} ${dim - 2 * builtinPadding} ${
        dim - 2 * builtinPadding
      }`;
      return { path, viewbox };
    },
  }),
);
