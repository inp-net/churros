/* eslint-disable */
import ldap from 'ldapjs';
import { faker } from '@faker-js/faker/locale/fr';

const server = ldap.createServer();

const asciify = (/** @type {string} */ str) =>
  str.normalize('NFD').replaceAll(/\W/gu, '').toLowerCase();

const emails = ['etu.inp-n7.fr', 'etu.enseeiht.fr', 'etu.toulouse-inp.fr'];
const pick = (/** @type {any[]} */ arr) => arr[Math.floor(Math.random() * arr.length)];

const users = new Map(
  Array.from({ length: 10 }).map(() => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const suffix = Math.random() > 0.8 ? '2' : '';
    const supannAliasLogin = `${asciify(firstName)}.${asciify(lastName)}${suffix}`;
    const mail = `${supannAliasLogin}@${pick(emails)}`;
    const uid = `${asciify(firstName).slice(0, 1)}${asciify(lastName).slice(0, 6)}${suffix}`;

    return [
      supannAliasLogin,
      {
        dn: `uid=${uid},ou=people,dc=n7,dc=fr`,
        attributes: { supannAliasLogin, uid, givenName: firstName, sn: lastName, mail },
      },
    ];
  })
);

console.log('Available users:', [...users.keys()].join(', '));

server.search('ou=people,dc=n7,dc=fr', (req, res, next) => {
  // Return all users when no filter is given
  if (req.filter instanceof ldap.PresenceFilter && req.filter.attribute === 'objectclass') {
    for (const user of users.values()) res.send(user);
    res.end();
  }

  // Process only one specific filter, refuse other filters
  if (!(req.filter instanceof ldap.EqualityFilter) || req.filter.attribute !== 'supannaliaslogin') {
    next(new ldap.InsufficientAccessRightsError());
    return;
  }

  if (users.has(req.filter.value)) res.send(users.get(req.filter.value));

  res.end();
});

server.listen(1389, 'localhost', () => {
  console.log(`Mock n7 ldap server listening on ${server.url}`);
});
