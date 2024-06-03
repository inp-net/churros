import { builder, prisma, pubsub, subscriptionName } from '#lib';

builder.mutationField('kioskReload', (t) =>
  t.boolean({
    args: {
      studentAssociation: t.arg.string({
        description:
          "UID de l'AE sur laquelle on veut indiquer que les kiosques concernés doivent être re-chargés",
      }),
    },
    async authScopes(_, { studentAssociation }, { user }) {
      if (!user) return false;
      return (
        user.admin || user.adminOfStudentAssociations.some((sa) => sa.uid === studentAssociation)
      );
    },
    async resolve(_, { studentAssociation }, { user }) {
      if (!user) return false;
      if (!user.major) return false;

      const majorsToReload = await prisma.major.findMany({
        where: {
          schools: {
            some: {
              studentAssociations: {
                some: {
                  uid: studentAssociation,
                },
              },
            },
          },
        },
      });

      for (const major of majorsToReload)
        pubsub.publish(subscriptionName('KioskReload', 'updated', major.uid), true);

      return true;
    },
  }),
);
