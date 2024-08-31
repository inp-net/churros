import { graphql } from '$houdini';

export const UpdateUserRealName = graphql(`
  mutation UpdateUserRealName($uid: UID!, $firstName: String!, $lastName: String!) {
    updateUserProfile(uid: $uid, profile: { firstName: $firstName, lastName: $lastName }) {
      ...MutationErrors
      ... on MutationUpdateUserProfileSuccess {
        data {
          firstName
          fullName
        }
      }
    }
  }
`);

export const UpdateUserNickname = graphql(`
  mutation UpdateUserNickname($uid: UID!, $nickname: String!) {
    updateUserProfile(uid: $uid, profile: { nickname: $nickname }) {
      ...MutationErrors
      ... on MutationUpdateUserProfileSuccess {
        data {
          nickname
        }
      }
    }
  }
`);

export const SetUserPhone = graphql(`
  mutation SetUserPhone($uid: UID!, $phone: PhoneNumber!) {
    updateUserProfile(uid: $uid, profile: { phone: $phone }) {
      ...MutationErrors
      ... on MutationUpdateUserProfileSuccess {
        data {
          phone
        }
      }
    }
  }
`);

export const ClearUserPhone = graphql(`
  mutation ClearUserPhone($uid: UID!) {
    updateUserProfile(uid: $uid, profile: { unsetPhone: true }) {
      ...MutationErrors
      ... on MutationUpdateUserProfileSuccess {
        data {
          phone
        }
      }
    }
  }
`);

export const UpdateUserAddress = graphql(`
  mutation UpdateUserAddress($uid: UID!, $address: String!) {
    updateUserProfile(uid: $uid, profile: { address: $address }) {
      ...MutationErrors
      ... on MutationUpdateUserProfileSuccess {
        data {
          address
        }
      }
    }
  }
`);

export const SetUserBirthday = graphql(`
  mutation SetUserBirthday($uid: UID!, $birthday: DateTime!) {
    updateUserProfile(uid: $uid, profile: { birthday: $birthday }) {
      ...MutationErrors
      ... on MutationUpdateUserProfileSuccess {
        data {
          birthday
        }
      }
    }
  }
`);

export const ClearUserBirthday = graphql(`
  mutation ClearUserBirthday($uid: UID!) {
    updateUserProfile(uid: $uid, profile: { unsetBirthday: true }) {
      ...MutationErrors
      ... on MutationUpdateUserProfileSuccess {
        data {
          birthday
        }
      }
    }
  }
`);

export const UpdateUserBio = graphql(`
  mutation UpdateUserBio($uid: UID!, $bio: Markdown!) {
    updateUserProfile(uid: $uid, profile: { description: $bio }) {
      ...MutationErrors
      ... on MutationUpdateUserProfileSuccess {
        data {
          description
        }
      }
    }
  }
`);

export const UpdateUserOtherEmails = graphql(`
  mutation UpdateUserOtherEmails($uid: UID!, $emails: [Email!]!) {
    updateUserProfile(uid: $uid, profile: { otherEmails: $emails }) {
      ...MutationErrors
      ... on MutationUpdateUserProfileSuccess {
        data {
          otherEmails
        }
      }
    }
  }
`);

export const UpdateUserCurriculum = graphql(`
  mutation UpdateUserCurriculum(
    $uid: UID!
    $major: UID
    $graduationYear: PositiveInt!
    $apprentice: Boolean!
    $external: Boolean!
  ) {
    updateUserCurriculum(
      apprentice: $apprentice
      external: $external
      graduationYear: $graduationYear
      uid: $uid
      major: $major
    ) {
      ...MutationErrors
      ... on MutationUpdateUserCurriculumSuccess {
        data {
          apprentice
          graduationYear
          yearTier
          major {
            uid
          }
        }
      }
    }
  }
`);
