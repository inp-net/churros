import { builder } from '#lib';
import { CommentType } from '#modules/comments';
import { CommentsConnectionType } from './comments-connection.js';

interface Commentable {
  comments: typeof CommentsConnectionType.$inferType;
  id: string;
}

export const CommentableInterface = builder.interfaceRef<Commentable>('Commentable').implement({
  name: 'Commentable',
  description: 'Une resource pouvant être commentée par les utilisateur·ice·s',
  fields: (t) => ({
    id: t.exposeID('id', { description: 'L’identifiant de la resource commentée' }),
    canComment: t.boolean({
      description: 'On peut commenter sur cette ressource',
      resolve: (_, __, { user }) => Boolean(user),
    }),
    comments: t.connection(
      {
        type: CommentType,
        resolve: (parent) => parent.comments,
      },
      CommentsConnectionType,
    ),
  }),
});
