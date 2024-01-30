import { builder, toHtml } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { IssueCommentType, IssueState, IssueStateType, type IssueComment } from '../index.js';

type Issue = {
  title: string;
  state: IssueState;
  body: string;
  submittedAt: Date;
  importance: number | null;
  difficulty: number | null;
  number: number;
  deployedIn: string;
  duplicatedFrom: number | null;
  comments: IssueComment[];
};

export const IssueType = builder.objectRef<Issue>('Issue').implement({
  description: 'A Gitlab issue',
  fields: (t) => ({
    title: t.exposeString('title'),
    state: t.expose('state', { type: IssueStateType }),
    body: t.exposeString('body'),
    bodyHtml: t.string({
      async resolve({ body }) {
        return toHtml(body, { linkifyGitlabItems: true, linkifyUserMentions: false });
      },
    }),
    submittedAt: t.expose('submittedAt', {
      type: DateTimeScalar,
      description: 'The date at which the issue was submitted',
    }),
    importance: t.exposeFloat('importance', {
      nullable: true,
      description: 'Expressed from 0 to 1',
    }),
    difficulty: t.exposeFloat('difficulty', {
      nullable: true,
      description: 'Expressed from 0 to 1',
    }),
    number: t.exposeInt('number'),
    url: t.string({
      resolve({ number }) {
        return `https://git.inpt.fr/inp-net/churros/-/issues/${number}`;
      },
    }),
    deployedIn: t.exposeString('deployedIn'),
    duplicatedFrom: t.exposeInt('duplicatedFrom', { nullable: true }),
    comments: t.field({
      type: [IssueCommentType],
      resolve({ comments }) {
        return comments;
      },
    }),
  }),
});
