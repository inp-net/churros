import { prisma } from '#lib';

const apiUrl = process.env.MAILMAN_API_URL as unknown as string;
const apiToken = process.env.MAILMAN_API_TOKEN as unknown as string;

const mailingAllBureau = 'all_bureau@list.bde.enseeiht.fr';
const mailingAllPrez = 'all_prez@list.bde.enseeiht.fr';
const mailingAllTrez = 'all_trez@list.bde.enseeiht.fr';

export async function removeMemberFromGroupMailingList(groupId: string, email: string) {
  const group = await prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    select: {
      ldapUid: true,
      studentAssociation: { select: { school: { select: { internalMailDomain: true } } } },
    },
  });

  const mailing = `${group.ldapUid}@list.${group.studentAssociation?.school.internalMailDomain}`;
  await removeMemberFromMailingList(mailing, email);
}

async function removeMemberFromMailingList(mailing: string, email: string) {
  const endpoint = `${apiUrl}/${mailing}/member/${email}`;
  await fetch(endpoint, {
    method: 'DELETE',
    headers: { Authorization: 'Basic ' + apiToken },
  });
}

export async function removeMemberFromBureauLists(memberID: string) {
  const { email } = await prisma.user.findUniqueOrThrow({
    where: { id: memberID },
    select: {
      email: true,
    },
  });

  const { groups: bureauGroups } = await prisma.user.findUniqueOrThrow({
    where: {
      id: memberID,
      groups: {
        some: {
          OR: [
            { president: true },
            { vicePresident: true },
            { treasurer: true },
            { secretary: true },
          ],
          group: { OR: [{ type: 'Association' }, { type: 'Club' }] },
        },
      },
    },
    select: {
      groups: { select: { title: true } },
    },
  });
  const { groups: prezGroups } = await prisma.user.findUniqueOrThrow({
    where: {
      id: memberID,
      groups: {
        some: { president: true, group: { OR: [{ type: 'Association' }, { type: 'Club' }] } },
      },
    },
    select: {
      groups: { select: { title: true } },
    },
  });
  const { groups: trezGroups } = await prisma.user.findUniqueOrThrow({
    where: {
      id: memberID,
      groups: {
        some: { treasurer: true, group: { OR: [{ type: 'Association' }, { type: 'Club' }] } },
      },
    },
    select: {
      groups: { select: { title: true } },
    },
  });

  if (bureauGroups.length === 0) removeMemberFromMailingList(mailingAllBureau, email);

  if (prezGroups.length === 0) removeMemberFromMailingList(mailingAllPrez, email);

  if (trezGroups.length === 0) removeMemberFromMailingList(mailingAllTrez, email);
}

export async function addMemberToGroupMailingList(groupId: string, email: string) {
  const group = await prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    select: {
      ldapUid: true,
      studentAssociation: { select: { school: { select: { internalMailDomain: true } } } },
    },
  });

  const mailingId = `${group.ldapUid}.list.${group.studentAssociation?.school.internalMailDomain}`;
  await addMemberToMailingList(mailingId, email);
}

async function addMemberToMailingList(mailingId: string, email: string) {
  const endpoint = `${apiUrl}/${mailingId}/member`;
  await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + apiToken },
    body: JSON.stringify({
      subscriber: email,
      list_id: mailingId,
      pre_verified: true,
      pre_confirmed: true,
      pre_approved: true,
    }),
  });
}
