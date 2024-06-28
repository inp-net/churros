import { builder, type SearchResult } from '#lib';
import type { Form } from '@churros/db/prisma';
import { FormType } from './form.js';

export const FormSearchResultType = builder
  .objectRef<SearchResult<{ form: Form }, ['description']>>('FormSearchResult')
  .implement({
    fields: (t) => ({
      form: t.prismaField({
        type: FormType,
        resolve: (_, { form }) => form,
      }),
      id: t.exposeID('id'),
      similarity: t.exposeFloat('similarity'),
      rank: t.exposeFloat('rank', { nullable: true }),
      highlightedDescription: t.string({
        resolve: ({ highlights }) => highlights.description,
      }),
    }),
  });
