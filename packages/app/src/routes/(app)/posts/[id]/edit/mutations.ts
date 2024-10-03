import { graphql } from '$houdini';

export const ChangeGroup = graphql(`
  mutation ChangePostGroup($post: LocalID!, $group: UID!) {
    changePostOwner(post: $post, group: $group) {
      ...MutationErrors
      ... on MutationChangePostOwnerSuccess {
        data {
          group {
            id
          }
        }
      }
    }
  }
`);

export const ChangeTitle = graphql(`
  mutation ChangePostTitle($post: LocalID!, $title: String!) {
    upsertArticle: upsertArticleV2(id: $post, input: { title: $title }) {
      ...MutationErrors
      ... on MutationUpsertArticleV2Success {
        data {
          title
        }
      }
    }
  }
`);

export const ChangeBody = graphql(`
  mutation ChangePostBody($post: LocalID!, $body: String!) {
    upsertArticle: upsertArticleV2(id: $post, input: { body: $body }) {
      ...MutationErrors
      ... on MutationUpsertArticleV2Success {
        data {
          body
        }
      }
    }
  }
`);

export const ChangePostVisibility = graphql(`
  mutation ChangePostVisibility($post: LocalID!, $visibility: Visibility!) {
    upsertArticle: upsertArticleV2(id: $post, input: { visibility: $visibility }) {
      ...MutationErrors
      ... on MutationUpsertArticleV2Success {
        data {
          visibility
        }
      }
    }
  }
`);

export const ChangeLinkedEvent = graphql(`
  mutation ChangePostLinkedEvent($post: LocalID!, $event: LocalID!) {
    upsertArticle: upsertArticleV2(id: $post, input: { event: $event }) {
      ...MutationErrors
      ... on MutationUpsertArticleV2Success {
        data {
          event {
            id
          }
        }
      }
    }
  }
`);

export const UnlinkEvent = graphql(`
  mutation UnlinkPostEvent($post: LocalID!) {
    unlinkEventFromPost(post: $post) {
      ...MutationErrors
      ... on MutationUnlinkEventFromPostSuccess {
        data {
          event {
            id
          }
        }
      }
    }
  }
`);
