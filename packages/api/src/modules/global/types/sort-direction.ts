import { builder } from '#lib';

export enum SortDirection {
  Ascending,
  Descending,
}

export const SortDirectionEnum = builder.enumType(SortDirection, {
  name: 'SortDirection',
});
