import { builder } from '#lib';
import { CommentType } from '#modules/comments';
import { CommentsConnectionType } from './comments-connection.js';

// export class Commentable {
//   comments: typeof CommentsConnectionType.$inferType;

//   constructor(comments: typeof CommentsConnectionType.$inferType) {
//     this.comments = comments;
//   }
// }

interface Commentable {
  comments: typeof CommentsConnectionType.$inferType;
  id: string;
}

export const CommentableInterface = builder.interfaceRef<Commentable>('Commentable').implement({
  name: 'Commentable',
  description: 'Une resource pouvant être commentée par les utilisateur·ice·s',
  fields: (t) => ({
    id: t.exposeID('id', { description: 'L’identifiant de la resource commentée' }),
    comments: t.connection(
      {
        type: CommentType,
        resolve: (parent) =>
          // @ts-expect-error dunno why it complainnns
          parent.comments,
      },
      CommentsConnectionType,
    ),
  }),
});

// export const CommentableType = builder.unionType('Commentable', {
//   types: [],
// });
