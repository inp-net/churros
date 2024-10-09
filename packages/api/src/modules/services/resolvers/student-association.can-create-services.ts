import { builder } from '#lib';
import { canCreateServicesOnStudentAssociation } from '#modules/services';
import { StudentAssociationType } from '#modules/student-associations';

builder.prismaObjectField(StudentAssociationType, 'canCreateServices', (t) =>
  t.boolean({
    description: "Si l'utilisateur·ice courant·e peut créer des services rattachés à cette AE",
    resolve: async (studentAssociation, _, { user }) => {
      return canCreateServicesOnStudentAssociation(user, studentAssociation);
    },
  }),
);
