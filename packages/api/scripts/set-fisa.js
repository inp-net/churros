import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
const p = new PrismaClient();
const data = JSON.parse(readFileSync('./fisas.json').toString());

let notfound = [];

/**
 * @param {string} str
 */
function unaccent(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
for (const { firstName, lastName, major } of data) {
  console.log(`${firstName} ${lastName} `);
  let user, error;
  try {
    user = await p.user.findFirst({
      where: {
        AND: [
          {
            OR: [
              { firstName: { search: firstName } },
              { firstName: { search: unaccent(firstName) } },
            ],
          },
          {
            OR: [{ lastName: { search: lastName } }, { lastName: { search: unaccent(lastName) } }],
          },
        ],
        graduationYear: { in: [2024, 2025] },
        major: {
          shortName: major,
        },
      },
    });
  } catch (err) {
    error = err;
  }
  if (user) {
    console.log(`=> ${user?.firstName} ${user?.lastName} (@${user?.uid})`);
    // await p.user.update({ where: { id: user.id }, data: { apprentice: true } });
  } else {
    notfound.push({ firstName, lastName });
    console.log(`=> not found, ${error ? 'error' : ''}`);
  }
  console.log();
}

for (const { firstName, lastName } of notfound) {
  console.log(`${firstName} \t\t\t${lastName}`);
}
