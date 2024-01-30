import { builder } from '#lib';
import { ReleaseChangeType, type ReleaseChange } from '../index.js';

export type ReleaseChangesMap = {
  fixed: ReleaseChange[];
  improved: ReleaseChange[];
  added: ReleaseChange[];
  security: ReleaseChange[];
  other: ReleaseChange[];
  technical: ReleaseChange[];
};

export const ReleaseChangesMapType = builder
  .objectRef<ReleaseChangesMap>('ReleaseChangesMaps')
  .implement({
    description: 'Changes in the changelog, grouped by category',
    fields: (t) => ({
      fixed: t.expose('fixed', { type: [ReleaseChangeType], description: 'What was fixed' }),
      improved: t.expose('improved', {
        type: [ReleaseChangeType],
        description: 'What was improved',
      }),
      added: t.expose('added', { type: [ReleaseChangeType], description: 'New features' }),
      security: t.expose('security', {
        type: [ReleaseChangeType],
        description: 'Security changes',
      }),
      other: t.expose('other', { type: [ReleaseChangeType], description: 'Miscalleanous changes' }),
      technical: t.expose('technical', {
        type: [ReleaseChangeType],
        description: 'Technical changes',
      }),
    }),
  });
