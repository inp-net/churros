import { graphql } from '$houdini';

export const Edit = graphql(`
  mutation EditComment($id: LocalID!, $body: Markdown!) {
    upsertComment(id: $id, body: $body) {
      ...MutationErrors
      ... on MutationUpsertCommentSuccess {
        data {
          ...CardCommentCore
        }
      }
    }
  }
`);

export const Delete = graphql(`
  mutation DeleteComment($id: LocalID!) {
    deleteComment(id: $id) {
      ...MutationErrors
      ... on MutationDeleteCommentSuccess {
        data {
          id @Comment_delete
        }
      }
    }
  }
`);

export const Add = graphql(`
  mutation AddComment($resource: ID!, $body: Markdown!) {
    upsertComment(resource: $resource, body: $body) {
      ...MutationErrors
      ... on MutationUpsertCommentSuccess {
        data {
          ...CardCommentCore
        }
      }
    }
  }
`);

export const Reply = graphql(`
  mutation ReplyComment($resource: ID!, $inReplyTo: LocalID!, $body: Markdown!) {
    upsertComment(resource: $resource, inReplyTo: $inReplyTo, body: $body) {
      ...MutationErrors
      ... on MutationUpsertCommentSuccess {
        data {
          ...CardCommentCore
        }
      }
    }
  }
`);
