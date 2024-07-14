import { graphql } from '$houdini';

export type PicturedObjects = 'Group' | 'User' | 'Article' | 'Event' | 'School';

export async function changePicture(
  obj: PicturedObjects,
  file: File,
  {
    id,
    uid,
    dark,
  }: {
    id: string;
    uid: string;
    dark: boolean;
  },
) {
  switch (obj) {
    case 'Article': {
      return await graphql(`
        mutation UpdatePostPicture($id: ID!, $file: File!) {
          updateArticlePicture(file: $file, id: $id)
        }
      `)
        .mutate({ id, file })
        .then((r) => r.data?.updateArticlePicture ?? '');
    }

    case 'Group': {
      return await graphql(`
        mutation UpdateGroupPicture($uid: UID!, $file: File!, $dark: Boolean!) {
          updateGroupPicture(file: $file, uid: $uid, dark: $dark)
        }
      `)
        .mutate({ uid, file, dark })
        .then((r) => r.data?.updateGroupPicture ?? '');
    }

    case 'User': {
      return await graphql(`
        mutation UpdateUserPicture($uid: UID!, $file: File!) {
          updateUserPicture(file: $file, uid: $uid)
        }
      `)
        .mutate({ uid, file })
        .then((r) => r.data?.updateUserPicture ?? '');
    }
    case 'Event': {
      return await graphql(`
        mutation UpdateEventPicture($id: ID!, $file: File!) {
          updateEventPicture(file: $file, id: $id)
        }
      `)
        .mutate({ id, file })
        .then((r) => r.data?.updateEventPicture ?? '');
    }
    case 'School': {
      return await graphql(`
        mutation UpdateSchoolPicture($id: ID!, $file: File!) {
          updateSchoolPicture(file: $file, id: $id)
        }
      `)
        .mutate({ id, file })
        .then((r) => r.data?.updateSchoolPicture ?? '');
    }

    default: {
      break;
    }
  }
}

export async function removePicture(
  obj: PicturedObjects,
  {
    id,
    uid,
    dark,
  }: {
    id: string;
    uid: string;
    dark: boolean;
  },
) {
  switch (obj) {
    case 'Article': {
      return await graphql(`
        mutation DeletePostPicture($id: ID!) {
          deleteArticlePicture(id: $id)
        }
      `)
        .mutate({ id })
        .then((r) => r.data?.deleteArticlePicture ?? false);
    }

    case 'Group': {
      return await graphql(`
        mutation DeleteGroupPicture($uid: UID!, $dark: Boolean!) {
          deleteGroupPicture(uid: $uid, dark: $dark)
        }
      `)
        .mutate({ uid, dark })
        .then((r) => r.data?.deleteGroupPicture ?? false);
    }

    case 'User': {
      return await graphql(`
        mutation DeleteUserPicture($uid: UID!) {
          deleteUserPicture(uid: $uid)
        }
      `)
        .mutate({ uid })
        .then((r) => r.data?.deleteUserPicture ?? false);
    }
    case 'Event': {
      return await graphql(`
        mutation DeleteEventPicture($id: ID!) {
          deleteEventPicture(id: $id)
        }
      `)
        .mutate({ id })
        .then((r) => r.data?.deleteEventPicture ?? false);
    }
    case 'School': {
      return await graphql(`
        mutation DeleteSchoolPicture($id: ID!) {
          deleteSchoolPicture(id: $id)
        }
      `)
        .mutate({ id })
        .then((r) => r.data?.deleteSchoolPicture ?? false);
    }

    default: {
      break;
    }
  }
}
