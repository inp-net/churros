import { builder } from '#lib';
import { DocumentType } from '#modules/documents';
import {} from '#modules/global';
import { CommentType, CommentsConnectionType } from '../index.js';

builder.prismaObjectField(DocumentType, 'comments', (t) =>
  t.relatedConnection(
    'comments',
    {
      cursor: 'id',
      type: CommentType,
      query: {
        orderBy: { createdAt: 'asc' },
      },
    },
    CommentsConnectionType,
  ),
);
