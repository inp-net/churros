import type { Prisma, School } from '@churros/db/prisma';
import { replaceMailDomainPart } from './school-emails.js';

export function fullName(user: { firstName: string; lastName: string; nickname?: string }) {
  const { firstName, lastName, nickname } = user;
  if (nickname) return `${firstName} ${lastName} (${nickname})`;
  return `${firstName} ${lastName}`;
}

/**
 * Create prisma clauses to search for a user by email or uid, taking into account alias mail domains for schools.
 * @param schools all schools of the instance
 * @param email the input email or uid
 * @returns clauses: an array of prisma clauses to be OR'ed in a query; uidOrEmail: the input email or uid; processed (basically lowercased and trimmed)
 */
export function emailLoginPrismaClauses(
  schools: School[],
  email: string,
): { clauses: Prisma.UserWhereInput[]; uidOrEmail: string } {
  const schoolDomainsPerSchool = Object.fromEntries(
    schools.map((school) => [school.uid, [school.studentMailDomain, ...school.aliasMailDomains]]),
  );
  const schoolDomains = Object.values(schoolDomainsPerSchool);
  const [_, domain] = email.split('@', 2);
  const uidOrEmail = email.trim().toLowerCase();
  //Ici on définit les clauses du prisma pour chercher un utilisateur, soit par uid ou par email dans le cas ou il rentre l'un des deux
  //De plus si l'utilisateur est dans une école, on cherche aussi par email dans les domaines de l'école ou cas ou il rentre un un alias de son école au lieu du bon mail
  //Le if sert à vérifier que le premier domaine est inclus dans les écoles (car on ne doit pas remplacer un mail genre @ewen.works ou n'importe quel domaine avec un @etu.inp-n7.fr)
  let prismaWhereClause: Prisma.UserWhereInput[] = [{ uid: uidOrEmail }, { email: uidOrEmail }];

  if (domain && schoolDomains.flat().includes(domain)) {
    prismaWhereClause = [
      ...prismaWhereClause,
      ...Object.entries(schoolDomainsPerSchool).map(
        ([schoolUid, domains]) =>
          ({
            //ici on map pour chaque école si l'utilisateur est dans l'école et on remplace le mail par TOUS les domaines de l'école
            //On fait ça pour que si l'utilisateur rentre un alias de son mail, on le trouve quand même
            major: { schools: { some: { uid: schoolUid } } },
            email: {
              in: domains.map((domain) => replaceMailDomainPart(uidOrEmail, domain)),
            },
          }) satisfies Prisma.UserWhereInput,
      ),
    ];
  }
  return { clauses: prismaWhereClause, uidOrEmail };
}
