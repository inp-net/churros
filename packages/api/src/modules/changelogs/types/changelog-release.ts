import { builder, toHtml } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { ReleaseChangesMapType, type ReleaseChangesMap } from '../index.js';

export type ChangelogRelease = {
  version: string;
  date: Date | undefined;
  changes: ReleaseChangesMap;
  description: string;
};

export const ChangelogReleaseType = builder
  .objectRef<ChangelogRelease>('ChangelogRelease')
  .implement({
    description: 'A release in the changelog',
    fields: (t) => ({
      version: t.exposeString('version', { description: 'The version of the release' }),
      date: t.expose('date', {
        type: DateTimeScalar,
        nullable: true,
        description: 'The date of the release',
      }),
      changes: t.expose('changes', {
        type: ReleaseChangesMapType,
        description: 'The changes of the release, grouped by category',
      }),
      description: t.exposeString('description', {
        description: 'A short description of the release',
      }),
      descriptionHtml: t.string({
        description: 'A short description of the release, in HTML. Safe from XSS.',
        async resolve({ description }) {
          return toHtml(description);
        },
      }),
    }),
  });
