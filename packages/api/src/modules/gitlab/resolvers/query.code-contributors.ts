import { builder, prisma } from '#lib';

import { UserType } from '#modules/users';
import { GraphQLError } from 'graphql';
import uniqBy from 'lodash.uniqby';

builder.queryField('codeContributors', (t) =>
  t.prismaField({
    type: [UserType],
    errors: {},
    authScopes: () => true,
    async resolve() {
      const codeContributors = (await fetch(
        `https:///git.inpt.fr/api/v4/projects/${process.env.GITLAB_PROJECT_ID}/repository/contributors?pagination=keyset&per_page=1000&order_by=commits&sort=desc`,
      )
        .then(async (r) => r.json())
        .catch(() => {
          throw new GraphQLError('Connexion à git.inpt.fr impossible');
        })) as Array<{
        name: string;
        email: string;
        commits: number;
        additions: number;
        deletions: number;
      }>;
      const contributorEmails = [
        ...new Set(codeContributors.map((contributor) => contributor.email)),
      ];

      // TODO Ce changement ne fonctionnera pas si churros est déployé sur une autre instance qui n'est pas celle de toulouse inp
      //(car les écoles ne contiendront pas ENSEEIHT etc) du coup on filtera des adresses enseeiht sur des écoles qui ne contiennent pas enseeiht etc
      const schools = await prisma.school.findMany();
      const schoolNames = schools.flatMap((school) => `@bde.${school.name.toLowerCase()}.fr`);
      const uids = contributorEmails
        .filter((e) => schoolNames.some((s) => e.endsWith(s)))
        .map((e) => e.replace(/@[^@]+$/, ''));
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { email: { in: contributorEmails } },
            {
              otherEmails: { hasSome: contributorEmails },
            },
            {
              uid: { in: uids },
            },
          ],
        },
      });

      return uniqBy(users, (u) => u.id);
    },
  }),
);
