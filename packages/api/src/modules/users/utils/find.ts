import { prisma } from '#lib';
import type { Prisma } from '@prisma/client';

export async function userByEmail<Includes extends Prisma.UserInclude>(
  email: string,
  prismaIncludes: Includes,
) {
  const schools = await prisma.school.findMany();
  const schoolDomain = schools.map((school) => [
    school.uid,
    [school.internalMailDomain, ...school.aliasMailDomains],
  ]);
  const schoolDomains = schoolDomain.flatMap(([_, domains]) => domains);
  const [_, domain] = email.split('@', 2);
  const uidOrEmail = email.trim().toLowerCase();
  //Ici on définit les clauses du prisma pour chercher un utilisateur, soit par uid ou par email dans le cas ou il rentre l'un des deux
  //De plus si l'utilisateur est dans une école, on cherche aussi par email dans les domaines de l'école ou cas ou il rentre un un alias de son école au lieu du bon mail
  //Le if sert à vérifier que le premier domaine est inclus dans les écoles (car on ne doit pas remplacer un mail genre @ewen.works ou n'importe quel domaine avec un @etu.inp-n7.fr)
  let prismaClauses: Prisma.UserWhereInput['OR'] = [
    {
      uid: {
        equals: uidOrEmail,
        mode: 'insensitive',
      },
    },
    {
      email: {
        equals: uidOrEmail,
        mode: 'insensitive',
      },
    },
  ];
  if (schoolDomains.includes(domain)) {
    prismaClauses = [
      ...prismaClauses,
      ...schoolDomain.map(([schoolUid, domains]) => {
        const schoolEmailsToTry = Array.isArray(domains)
          ? domains.map((domain: string) => uidOrEmail.replace(/@[^@]+$/, `@${domain}`))
          : [uidOrEmail.replace(/@[^@]+$/, `@${domains}`)];
        return {
          //ici on map pour chaque école si l'utilisateur est dans l'école et on remplace le mail par TOUS les domaines de l'école
          //On fait ça pour que si l'utilisateur rentre un alias de son mail, on le trouve quand même
          major: { schools: { some: { uid: schoolUid } } },
          email: {
            in: schoolEmailsToTry,
            mode: 'insensitive',
          },
        } as Prisma.UserWhereInput;
      }),
    ];
  }
  const user = await prisma.user.findFirst({
    where: { OR: prismaClauses },
    include: prismaIncludes,
  });
  return { user, uidOrEmail };
}
