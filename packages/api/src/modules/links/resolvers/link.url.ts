import { builder } from '#lib';
import { URLScalar } from '#modules/global';
import { LinkType } from '#modules/links/types';
import { renderURL } from '#modules/links/utils';

builder.prismaObjectField(LinkType, 'url', (t) =>
  t.field({
    type: URLScalar,
    nullable: true,
    resolve({ value }, _, { user }) {
      const rendered = renderURL(value, user);
      return URL.canParse(rendered) ? new URL(rendered) : null;
    },
  }),
);
