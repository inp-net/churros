import { builder } from '#lib';

import * as qrcode from 'qr-code-generator-lib';
import { QRCodeType } from '../index.js';
// TODO rename to booking.qr-code

builder.queryField('registrationQRCode', (t) =>
  t.field({
    type: QRCodeType,
    description: 'Returns an SVG path of the QR Code for the given registration',
    args: {
      id: t.arg.id(),
    },
    authScopes() {
      return true;
    },
    resolve(_, { id }) {
      const { d: path, dim } = qrcode.renderPath(qrcode.getMatrix(id));
      const builtinPadding = 4;
      const viewbox = `${builtinPadding} ${builtinPadding} ${dim - 2 * builtinPadding} ${
        dim - 2 * builtinPadding
      }`;
      return { path, viewbox };
    },
  }),
);
