import { builder, log, objectValuesFlat, prisma, updatePicture } from '#lib';
import { FileScalar } from '#modules/global';
import { userIsAdminOf, userIsGroupEditorOf } from '#permissions';

/** Update the club's picture */
builder.mutationField('updateGroupPicture', (t) =>
  t.field({
    deprecationReason: 'Use setPicture instead',
    type: 'String',
    args: {
      uid: t.arg.string(),
      file: t.arg({ type: FileScalar }),
      dark: t.arg.boolean(),
    },
    async authScopes(_, { uid }, { user }) {
      const studentAssociationIds = objectValuesFlat(
        await prisma.group.findUniqueOrThrow({
          where: { uid },
          select: { studentAssociationId: true },
        }),
      );
      return Boolean(
        userIsAdminOf(user, studentAssociationIds) ||
          userIsGroupEditorOf(user, studentAssociationIds) ||
          user?.groups.some(({ group }) => group.uid === uid),
      );
    },
    async resolve(_, { uid, file, dark }, { user }) {
      const picture = updatePicture({
        resource: 'group',
        folder: dark ? 'groups/dark' : 'groups',
        extension: 'png',
        file,
        identifier: uid,
        propertyName: dark ? 'pictureFileDark' : 'pictureFile',
      });
      await log(
        'group',
        'update',
        { message: `Mise à jour de la photo ${dark ? 'sombre' : 'claire'}` },
        uid,
        user,
      );
      return picture;
    },
  }),
);
