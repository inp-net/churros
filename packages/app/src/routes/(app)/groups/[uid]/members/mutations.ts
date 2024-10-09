import { graphql } from '$houdini';

export const AddGroupMember = graphql(`
  mutation AddGroupMember($group: UID!, $user: UID!) {
    addGroupMemberV2(group: $group, user: $user) {
      ...MutationErrors
      ... on MutationAddGroupMemberV2Success {
        data {
          group {
            members {
              edges {
                node {
                  user {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);

export const UpdateGroupMemberTitle = graphql(`
  mutation UpdateGroupMemberTitle($group: UID!, $user: UID!, $title: String!) {
    updateGroupMember(group: $group, user: $user, input: { title: $title }) {
      ...MutationErrors
      ... on MutationUpdateGroupMemberSuccess {
        data {
          title
        }
      }
    }
  }
`);

export const UpdateGroupMemberCreatedAt = graphql(`
  mutation UpdateGroupMemberCreatedAt($group: UID!, $user: UID!, $createdAt: DateTime!) {
    updateGroupMember(group: $group, user: $user, input: { createdAt: $createdAt }) {
      ...MutationErrors
      ... on MutationUpdateGroupMemberSuccess {
        data {
          createdAt
        }
      }
    }
  }
`);

export const UpdateGroupMemberRoles = graphql(`
  mutation UpdateGroupMemberRoles(
    $group: UID!
    $user: UID!
    $president: Boolean!
    $vicePresident: Boolean!
    $treasurer: Boolean!
    $secretary: Boolean!
  ) {
    updateGroupMember(
      group: $group
      user: $user
      input: {
        president: $president
        treasurer: $treasurer
        vicePresident: $vicePresident
        secretary: $secretary
      }
    ) {
      ...MutationErrors
      ... on MutationUpdateGroupMemberSuccess {
        data {
          onBoard
          president
          treasurer
          vicePresident
          secretary
          canBeEdited
          canEditArticles
          canEditMembers
          canScanEvents
        }
      }
    }
  }
`);

export const UpdateGroupMemberPermissions = graphql(`
  mutation UpdateGroupMemberPermissions(
    $group: UID!
    $user: UID!
    $canEditArticles: Boolean!
    $canEditMembers: Boolean!
    $canScanEvents: Boolean!
  ) {
    updateGroupMember(
      group: $group
      user: $user
      input: {
        canEditArticles: $canEditArticles
        canEditMembers: $canEditMembers
        canScanEvents: $canScanEvents
      }
    ) {
      ...MutationErrors
      ... on MutationUpdateGroupMemberSuccess {
        data {
          canBeEdited
          canEditArticles
          canEditMembers
          canScanEvents
        }
      }
    }
  }
`);

export const RemoveGroupMember = graphql(`
  mutation RemoveGroupMember($group: UID!, $user: UID!) {
    deleteGroupMember(group: $group, user: $user) {
      ...MutationErrors
      ... on MutationDeleteGroupMemberSuccess {
        data {
          group {
            members {
              edges {
                node {
                  user {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);
