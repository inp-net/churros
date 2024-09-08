import { graphql } from '$houdini';

export const UpdateTicketGroup = graphql(`
  mutation UpdateTicketGroup($group: LocalID!, $name: String, $capacity: Int) {
    upsertTicketGroup(id: $group, name: $name, capacity: $capacity) {
      ...MutationErrors
      ... on MutationUpsertTicketGroupSuccess {
        data {
          capacity
          name
        }
      }
    }
  }
`);
