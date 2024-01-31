import { builder } from '#lib';

export enum IssueState {
  Open,
  Closed,
  Deployed,
}

export const IssueStateType = builder.enumType(IssueState, {
  name: 'IssueState',
});
