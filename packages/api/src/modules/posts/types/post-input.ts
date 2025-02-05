import { builder } from '#lib';
import { DateTimeScalar, LocalID, VisibilityEnum } from '#modules/global';
import { differenceInDays } from 'date-fns';

export const PostInput = builder.inputType('PostInput', {
  fields: (t) => ({
    title: t.string({ required: false }),
    body: t.string({ required: false }),
    publishedAt: t.field({ type: DateTimeScalar, required: false }),
    event: t.field({ type: LocalID, required: false }),
    visibility: t.field({ type: VisibilityEnum, required: false }),
  }),
  validate: [
    [
      ({ publishedAt }) => Boolean(!publishedAt || differenceInDays(publishedAt, new Date()) >= 1),
      { message: 'Impossible de créer un post publié dans le passé.' },
    ],
  ],
});
