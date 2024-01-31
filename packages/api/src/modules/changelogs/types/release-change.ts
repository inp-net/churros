import { builder, toHtml } from '#lib';

export type ReleaseChange = {
  text: string;
  authors: string[];
  reporters: string[];
  issues: number[];
  mergeRequests: number[];
};

export const ReleaseChangeType = builder.objectRef<ReleaseChange>('ReleaseChange').implement({
  description: 'A change in the changelog',
  fields: (t) => ({
    text: t.exposeString('text', { description: 'The text of the change' }),
    html: t.string({
      async resolve({ text }) {
        return toHtml(text, { linkifyUserMentions: true, linkifyGitlabItems: true });
      },
    }),
    authors: t.exposeStringList('authors', {
      description: 'The authors of the change',
    }),
    issues: t.exposeIntList('issues', {
      description: 'Issues linked to the change',
    }),
    mergeRequests: t.exposeIntList('mergeRequests', {
      description: 'Merge requests linked to the change',
    }),
    reporters: t.exposeStringList('reporters', {
      description: 'People who created the issues (gave the idea, reported the bug, etc.)',
    }),
  }),
});
