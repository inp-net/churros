import { builder } from '#lib'
import {} from '#modules/global'
import {} from '../index.js'

export const QRCodeType = builder.objectRef<{ path: string; viewbox: string }>('QRCode').implement({
  fields: (t) => ({
    path: t.exposeString('path'),
    viewbox: t.exposeString('viewbox'),
  }),
});
