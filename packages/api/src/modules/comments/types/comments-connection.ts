import { builder } from '#lib';
import { CommentType } from './comment.js';

export const CommentsConnectionType = builder.connectionObject({
  type: CommentType,
  name: 'CommentsConnection',
});
