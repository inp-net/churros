import { builder, updatePicture } from '#lib';
import { FileScalar } from '#modules/global';
import { GraphQLError } from 'graphql';

builder.mutationField('updateSchoolPicture', (t) =>
  t.field({
    type: 'String',
    args: {
      id: t.arg.string(),
      file: t.arg({ type: FileScalar }),
    },
    authScopes: (_, __, { user }) => Boolean(user?.admin),
    async resolve(_, { id, file }, { user }) {
      if (!user?.admin) throw new GraphQLError('You do not have the rights to update this picture');

      return updatePicture({
        resource: 'school',
        folder: 'school',
        extension: 'png',
        file,
        identifier: id,
      });
    },
  }),
);
