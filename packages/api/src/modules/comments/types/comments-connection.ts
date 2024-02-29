import { builder } from '#lib';
import { CommentType } from '../index.js';

export const CommentsConnectionType = builder.connectionObject({
  type: CommentType,
  name: 'CommentsConnection',
});
