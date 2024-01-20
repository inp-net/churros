import { builder, toHtml } from '#lib';
import { DateTimeScalar } from '#modules/global';

export type IssueComment = {
  body: string;
  authorName: string;
  authorAvatarUrl: string;
  authorGitlabUrl: string;
  addedAt: Date;
};
export const IssueCommentType = builder.objectRef<IssueComment>('IssueComment').implement({
  description: 'A Gitlab issue comment',
  fields: (t) => ({
    body: t.exposeString('body'),
    bodyHtml: t.string({
      async resolve({ body }) {
        return toHtml(body, { linkifyGitlabItems: true, linkifyUserMentions: false });
      },
    }),
    authorName: t.exposeString('authorName'),
    authorAvatarUrl: t.exposeString('authorAvatarUrl'),
    authorGitlabUrl: t.exposeString('authorGitlabUrl'),
    addedAt: t.expose('addedAt', {
      type: DateTimeScalar,
      description: 'The date at which the comment was added',
    }),
  }),
});
