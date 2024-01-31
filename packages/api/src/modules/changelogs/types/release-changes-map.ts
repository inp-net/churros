import { builder } from '#lib'
import { ReleaseChangeType, type ReleaseChange } from '#modules'

export class ReleaseChangesMap {
  fixed!: ReleaseChange[];
  improved!: ReleaseChange[];
  added!: ReleaseChange[];
  security!: ReleaseChange[];
  other!: ReleaseChange[];
  technical!: ReleaseChange[];

  constructor(
    fixed: ReleaseChange[] = [],
    improved: ReleaseChange[] = [],
    added: ReleaseChange[] = [],
    security: ReleaseChange[] = [],
    other: ReleaseChange[] = [],
    technical: ReleaseChange[] = [],
  ) {
    this.fixed = fixed;
    this.improved = improved;
    this.added = added;
    this.security = security;
    this.other = other;
    this.technical = technical;
  }
}


export const ReleaseChangesMapType = builder.objectType(ReleaseChangesMap, {
  name: 'ReleaseChangesMap',
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
