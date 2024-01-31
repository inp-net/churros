import { builder } from '#lib';
import {} from '#modules/global';
import {} from '../index.js';

export enum IssueState {
  Open,
  Closed,
  Deployed,
}

export const IssueStateType = builder.enumType(IssueState, {
  name: 'IssueState',
});
