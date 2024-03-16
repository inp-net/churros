import { builder, log, updatePicture } from '#lib';
import {} from '#modules/global';
import {} from '../index.js';

builder.mutationField('updateStudentAssociationPicture', (t) =>
  t.field({
    type: 'String',
    args: {
      uid: t.arg.string(),
      file: t.arg({ type: 'File' }),
    },
    authScopes: (_, {}, { user }) => Boolean(user?.admin),
    async resolve(_, { uid, file }, { user }) {
      await log('student-association', 'update', {}, uid, user);
      return updatePicture({
        resource: 'student-association',
        folder: 'student-associations',
        extension: 'png',
        file,
        identifier: uid,
      });
    },
  }),
);
