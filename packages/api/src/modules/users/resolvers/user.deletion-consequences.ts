import { builder, prisma } from '#lib';
import { UserType } from '#modules/users/types';
import { GraphQLError } from 'graphql';

builder.prismaObjectField(UserType, 'deletionConsequences', (t) =>
  t.stringList({
    description: "Liste de messages expliquant les conséquences de la suppression de l'utilisateur",
    authScopes: { admin: true, $granted: 'me' },
    directives: {
      //   rateLimit: {
      //     duration: hoursToSeconds(1),
      //     limit: 3,
      //   },
    },
    async resolve({ id }) {
      try {
        // Make the delete in a transaction, always throw an error, and catch it here
        // This is a good way to "virtually" delete the user, get the deleted ressources, and come back
        await prisma.$transaction(async (tx) => {
          const result = await tx.user.delete({
            where: { id },
            select: {
              _count: {
                select: deletionCountsSelection,
              },
            },
          });
          throw new DeletionConsequences(result._count);
        });
      } catch (error) {
        if (error instanceof DeletionConsequences) {
          const { counts } = error;

          const countThing = (thing: string, count: number, plural = `${thing}s`) =>
            `${count} ${count > 1 ? plural : thing}`;

          const messages: string[] = [
            countThing('cotisation', counts.contributions),
            `${countThing('réponse', counts.formAnswers)} de formulaire`,
            `${countThing(
              'demande',
              counts.incomingGodparentRequests + counts.outgoingGodparentRequests,
            )} de parrainage`,
            countThing('réaction', counts.reactions),
            `${countThing('appartenance', counts.groups)} à des groupes`,
          ];

          return messages.filter((msg) => !msg.startsWith('0 '));
        }

        throw error;
      }

      // MDRRRR image tu vois ça
      throw new GraphQLError("Une erreur s'est produite, ton compte a été supprimé");
    },
  }),
);

// TODO intersect with generation from searching for all lines with User .* onDelete: Cascade in the Prisma schema, to ensure we don't say sth will be deleted when it won't
const deletionCountsSelection = {
  contributions: true,
  formAnswers: true,
  incomingGodparentRequests: true,
  outgoingGodparentRequests: true,
  reactions: true,
  groups: true,
} as const;

class DeletionConsequences extends Error {
  counts: { [K in keyof typeof deletionCountsSelection]: number };
  constructor(counts: { [K in keyof typeof deletionCountsSelection]: number }) {
    super('User deletion consequences');
    this.counts = counts;
  }
}
