import { graphql } from '$houdini';

export const UpdateServiceName = graphql(`
  mutation UpdateServiceName($id: LocalID!, $name: String!) {
    upsertServiceV2(id: $id, input: { name: $name }) {
      ...MutationErrors
      ... on MutationUpsertServiceV2Success {
        data {
          id
          name
        }
      }
    }
  }
`);

export const UpdateServiceURL = graphql(`
  mutation UpdateServiceURL($id: LocalID!, $url: LooseURL!) {
    upsertServiceV2(id: $id, input: { url: $url }) {
      ...MutationErrors
      ... on MutationUpsertServiceV2Success {
        data {
          id
          url
        }
      }
    }
  }
`);

export const UpdateServiceDescription = graphql(`
  mutation UpdateServiceDescription($id: LocalID!, $description: String!) {
    upsertServiceV2(id: $id, input: { description: $description }) {
      ...MutationErrors
      ... on MutationUpsertServiceV2Success {
        data {
          id
          description
        }
      }
    }
  }
`);

export const UpdateServiceLogo = graphql(`
  mutation UpdateServiceLogo($id: LocalID!, $logo: LooseURL!) {
    upsertServiceV2(id: $id, input: { iconURL: $logo }) {
      ...MutationErrors
      ... on MutationUpsertServiceV2Success {
        data {
          id
          logo
          logoSourceType
        }
      }
    }
  }
`);

export const RemoveServiceLogo = graphql(`
  mutation RemoveServiceLogo($id: LocalID!) {
    upsertServiceV2(id: $id, input: { removeIcon: true }) {
      ...MutationErrors
      ... on MutationUpsertServiceV2Success {
        data {
          id
          logo
          logoSourceType
        }
      }
    }
  }
`);

export const SetServiceGroup = graphql(`
  mutation SetServiceGroup($id: LocalID!, $group: UID!) {
    upsertServiceV2(id: $id, input: { group: $group }) {
      ...MutationErrors
      ... on MutationUpsertServiceV2Success {
        data {
          id
          group {
            id
            uid
            name
            ...AvatarGroup
          }
          owner {
            __typename
            ... on Group {
              id
              uid
              name
              ...AvatarGroup
            }
            ... on School {
              id
              uid
              name
              ...AvatarSchool
            }
            ... on StudentAssociation {
              id
              uid
              name
              ...AvatarStudentAssociation
            }
          }
        }
      }
    }
  }
`);

export const UnlinkServiceGroup = graphql(`
  mutation UnlinkServiceGroup($id: LocalID!) {
    upsertServiceV2(id: $id, input: { unlinkGroup: true }) {
      ...MutationErrors
      ... on MutationUpsertServiceV2Success {
        data {
          id
          group {
            id
          }
          owner {
            __typename
            ... on Group {
              id
              uid
              name
              ...AvatarGroup
            }
            ... on School {
              id
              uid
              name
              ...AvatarSchool
            }
            ... on StudentAssociation {
              id
              uid
              name
              ...AvatarStudentAssociation
            }
          }
        }
      }
    }
  }
`);

export const SetServiceStudentAssociation = graphql(`
  mutation SetServiceStudentAssociation($id: LocalID!, $studentAssociation: UID!) {
    upsertServiceV2(id: $id, input: { studentAssociation: $studentAssociation }) {
      ...MutationErrors
      ... on MutationUpsertServiceV2Success {
        data {
          id
          studentAssociation {
            id
            uid
            name
            ...AvatarStudentAssociation
          }
          owner {
            __typename
            ... on Group {
              id
              uid
              name
              ...AvatarGroup
            }
            ... on School {
              id
              uid
              name
              ...AvatarSchool
            }
            ... on StudentAssociation {
              id
              uid
              name
              ...AvatarStudentAssociation
            }
          }
        }
      }
    }
  }
`);

export const UnlinkServiceStudentAssociation = graphql(`
  mutation UnlinkServiceStudentAssociation($id: LocalID!) {
    upsertServiceV2(id: $id, input: { unlinkStudentAssociation: true }) {
      ...MutationErrors
      ... on MutationUpsertServiceV2Success {
        data {
          id
          studentAssociation {
            id
          }
          owner {
            __typename
            ... on Group {
              id
              uid
              name
              ...AvatarGroup
            }
            ... on School {
              id
              uid
              name
              ...AvatarSchool
            }
            ... on StudentAssociation {
              id
              uid
              name
              ...AvatarStudentAssociation
            }
          }
        }
      }
    }
  }
`);

export const SetServiceSchool = graphql(`
  mutation SetServiceSchool($id: LocalID!, $school: UID!) {
    upsertServiceV2(id: $id, input: { school: $school }) {
      ...MutationErrors
      ... on MutationUpsertServiceV2Success {
        data {
          id
          school {
            id
          }
          owner {
            __typename
            ... on Group {
              id
              uid
              name
              ...AvatarGroup
            }
            ... on School {
              id
              uid
              name
              ...AvatarSchool
            }
            ... on StudentAssociation {
              id
              uid
              name
              ...AvatarStudentAssociation
            }
          }
        }
      }
    }
  }
`);

export const UnlinkServiceSchool = graphql(`
  mutation UnlinkServiceSchool($id: LocalID!) {
    upsertServiceV2(id: $id, input: { unlinkSchool: true }) {
      ...MutationErrors
      ... on MutationUpsertServiceV2Success {
        data {
          id
          school {
            id
            uid
            name
            ...AvatarSchool
          }
          owner {
            __typename
            ... on Group {
              id
              uid
              name
              ...AvatarGroup
            }
            ... on School {
              id
              uid
              name
              ...AvatarSchool
            }
            ... on StudentAssociation {
              id
              uid
              name
              ...AvatarStudentAssociation
            }
          }
        }
      }
    }
  }
`);

export const UpdateServiceImportance = graphql(`
  mutation UpdateServiceImportance($id: LocalID!, $importance: Int!) {
    upsertServiceV2(id: $id, input: { importance: $importance }) {
      ...MutationErrors
      ... on MutationUpsertServiceV2Success {
        data {
          id
          importance
        }
      }
    }
  }
`);

export const UpdateServiceHidden = graphql(`
  mutation UpdateServiceHidden($id: LocalID!, $hidden: Boolean!) {
    upsertServiceV2(id: $id, input: { hide: $hidden }) {
      ...MutationErrors
      ... on MutationUpsertServiceV2Success {
        data {
          id
          hidden
        }
      }
    }
  }
`);
