/* eslint-disable unicorn/filename-case */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

export async function mutateObjectPicture(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $zeus: any,
  objectName: string,
  uid: string,
  id: string,
  dark: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  files: any,
): Promise<string> {
  return await $zeus.mutate(
    {
      [`update${objectName}Picture`]: [
        {
          ...(['Group', 'User'].includes(objectName) ? { uid } : { id }),
          ...(objectName === 'Group' ? { dark } : {}),
          file: Zvar('file', 'File!'),
        },
        true,
      ],
    },
    { variables: { file: files[0] } },
  )[`update${objectName}Picture`];
}

export async function deleteObjectPicture(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $zeus: any,
  objectName: string,
  uid: string,
  id: string,
  dark: boolean,
): Promise<boolean> {
  return await $zeus.mutate({
    [`delete${objectName}Picture`]: [
      {
        ...(['Group', 'User'].includes(objectName) ? { uid } : { id }),
        ...(objectName === 'Group' ? { dark } : {}),
      },
      true,
    ],
  })[`delete${objectName}Picture`];
}
