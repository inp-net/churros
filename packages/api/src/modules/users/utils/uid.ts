import { prisma, queryLdapUser } from '#lib';

import dichotomid from 'dichotomid';
import slug from 'slug';

export const createUid = async ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) => {
  const toAscii = (x: string) =>
    slug(x.toLocaleLowerCase(), {
      charmap: {
        é: 'e',
        è: 'e',
        ê: 'e',
        ë: 'e',
        à: 'a',
        â: 'a',
        ä: 'a',
        ô: 'o',
        ö: 'o',
        û: 'u',
        ü: 'u',
        ï: 'i',
        ç: 'c',
      },
    }).replaceAll('-', '');
  const base = toAscii(lastName).slice(0, 16) + toAscii(firstName).charAt(0);
  const n = await dichotomid(async (n) => {
    const uid = `${base}${n > 1 ? n : ''}`;
    const existDB = Boolean(await prisma.user.findFirst({ where: { uid } }));
    const existLdap = Boolean(
      process.env['NODE_ENV'] !== 'development' && (await queryLdapUser(uid)),
    );
    console.info(`${uid} exists in ldap? : ${existLdap.toString()}`);
    console.info(`${uid} exists in DB? : ${existDB.toString()}`);

    return !existDB && !existLdap;
  });
  return `${base}${n > 1 ? n : ''}`;
};
