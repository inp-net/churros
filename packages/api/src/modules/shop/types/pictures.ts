import { builder } from '#lib';

export const PictureType = builder.prismaObject('Picture', {
  fields: (t) => ({
    id: t.exposeID('id'),
    path: t.exposeString('path'),
    position: t.exposeInt('position'),
  }),
});
