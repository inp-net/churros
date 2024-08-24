import { graphql } from '$houdini';

export const SetGroupName = graphql(`
  mutation SetGroupName($uid: UID!, $name: String!) {
    updateGroupProfile(uid: $uid, profile: { name: $name }) {
      ...MutationErrors
      ... on MutationUpdateGroupProfileSuccess {
        data {
          name
        }
      }
    }
  }
`);

export const SetGroupShortDescription = graphql(`
  mutation SetGroupShortDescription($uid: UID!, $shortDescription: String!) {
    updateGroupProfile(uid: $uid, profile: { shortDescription: $shortDescription }) {
      ...MutationErrors
      ... on MutationUpdateGroupProfileSuccess {
        data {
          shortDescription
        }
      }
    }
  }
`);

export const SetGroupBio = graphql(`
  mutation SetGroupBio($uid: UID!, $bio: Markdown!) {
    updateGroupProfile(uid: $uid, profile: { longDescription: $bio }) {
      ...MutationErrors
      ... on MutationUpdateGroupProfileSuccess {
        data {
          longDescription
          longDescriptionHtml
        }
      }
    }
  }
`);

export const SetGroupRelatedGroups = graphql(`
  mutation SetGroupRelatedGroups($uid: UID!, $relatedGroups: [UID!]!) {
    updateGroupProfile(uid: $uid, profile: { relatedGroups: $relatedGroups }) {
      ...MutationErrors
      ... on MutationUpdateGroupProfileSuccess {
        data {
          related {
            ...AvatarGroup
          }
        }
      }
    }
  }
`);

export const SetGroupEmail = graphql(`
  mutation SetGroupEmail($uid: UID!, $email: Email!) {
    updateGroupProfile(uid: $uid, profile: { email: $email }) {
      ...MutationErrors
      ... on MutationUpdateGroupProfileSuccess {
        data {
          email
        }
      }
    }
  }
`);

export const ClearGroupEmail = graphql(`
  mutation ClearGroupEmail($uid: UID!) {
    updateGroupProfile(uid: $uid, profile: { unsetEmail: true }) {
      ...MutationErrors
      ... on MutationUpdateGroupProfileSuccess {
        data {
          email
        }
      }
    }
  }
`);

export const SetGroupRoom = graphql(`
  mutation SetGroupRoom($uid: UID!, $room: String!) {
    updateGroupProfile(uid: $uid, profile: { room: $room }) {
      ...MutationErrors
      ... on MutationUpdateGroupProfileSuccess {
        data {
          address
        }
      }
    }
  }
`);

export const ClearGroupColor = graphql(`
  mutation ClearGroupColor($uid: UID!) {
    updateGroupProfile(uid: $uid, profile: { unsetColor: true }) {
      ...MutationErrors
      ... on MutationUpdateGroupProfileSuccess {
        data {
          color
        }
      }
    }
  }
`);

export const SetGroupColor = graphql(`
  mutation SetGroupColor($uid: UID!, $color: Color!) {
    updateGroupProfile(uid: $uid, profile: { color: $color }) {
      ...MutationErrors
      ... on MutationUpdateGroupProfileSuccess {
        data {
          color
        }
      }
    }
  }
`);

export const SetGroupJoinPolicy = graphql(`
  mutation SetGroupJoinPolicy($uid: UID!, $policy: GroupJoinPolicy!) {
    setGroupJoinPolicy(uid: $uid, policy: $policy) {
      ...MutationErrors
      ... on MutationSetGroupJoinPolicySuccess {
        data {
          selfJoinable
        }
      }
    }
  }
`);

export const SetGroupParent = graphql(`
  mutation SetGroupParent($uid: UID!, $parentUid: UID) {
    setParentGroup(child: $uid, parent: $parentUid) {
      ...MutationErrors
      ... on MutationSetParentGroupSuccess {
        data {
          parent {
            ...AvatarGroup
          }
          root {
            ...AvatarGroup
          }
        }
      }
    }
  }
`);

export const SetGroupStudentAssociation = graphql(`
  mutation SetGroupStudentAssociation($uid: UID!, $studentAssociation: UID!) {
    setGroupStudentAssociation(group: $uid, studentAssociation: $studentAssociation) {
      ...MutationErrors
      ... on MutationSetGroupStudentAssociationSuccess {
        data {
          studentAssociation {
            ...AvatarStudentAssociation
          }
        }
      }
    }
  }
`);

export const SetGroupType = graphql(`
  mutation SetGroupType($uid: UID!, $type: GroupType!) {
    setGroupType(uid: $uid, type: $type) {
      ...MutationErrors
      ... on MutationSetGroupTypeSuccess {
        data {
          type
        }
      }
    }
  }
`);

export const SetGroupUnlisted = graphql(`
  mutation SetGroupUnlisted($uid: UID!, $unlisted: Boolean!) {
    setGroupType(uid: $uid, unlisted: $unlisted) {
      ...MutationErrors
      ... on MutationSetGroupTypeSuccess {
        data {
          unlisted
        }
      }
    }
  }
`);
