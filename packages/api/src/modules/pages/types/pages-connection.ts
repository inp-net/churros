import { builder } from '#lib';
import { PageType } from '#modules/pages';

export const PagesConnectionType = builder.connectionObject({
  name: 'PagesConnection',
  type: PageType,
});
