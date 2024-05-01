import { prisma } from '#lib';

const apiUrl = process.env.MAILMAN_API_URL as unknown as string;
const apiToken = process.env.MAILMAN_API_TOKEN as unknown as string;

export async function removeMemberFromGroupMailingList(groupId: string, email: string) {
  const group = await prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    select: {
      uid: true,
      studentAssociation: { select: { school: { select: { internalMailDomain: true } } } },
    },
  });

  const mailing = `${group.uid.replace(/-n7\b/, '')}@list.${group.studentAssociation?.school.internalMailDomain}`;
  await removeMemberFromMailingList(mailing, email);
}

async function removeMemberFromMailingList(mailing: string, email: string) {
  const endpoint = `${apiUrl}/${mailing}/member/${email}`;
  await fetch(endpoint, {
    method: 'DELETE',
    headers: { Authorization: 'Basic ' + apiToken },
  });
}

export async function updateMemberBoardLists(memberID: string, groupId: string) {
  const { studentAssociation } = await prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    include: {
      studentAssociation: {
        select: {
          allPrezMailingList: true,
          allTrezMailingList: true,
          allBoardMailingList: true,
        },
      },
    },
  });

  if (!studentAssociation) return;
  const { allPrezMailingList, allTrezMailingList, allBoardMailingList } = studentAssociation;

  const { email } = await prisma.user.findUniqueOrThrow({
    where: { id: memberID },
    select: {
      email: true,
    },
  });

  const nbBoard = await prisma.user.count({
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
  });
  const nbPrez = await prisma.user.count({
    where: {
      id: memberID,
      groups: {
        some: { president: true, group: { OR: [{ type: 'Association' }, { type: 'Club' }] } },
      },
    },
  });
  const nbTrez = await prisma.user.count({
    where: {
      id: memberID,
      groups: {
        some: { treasurer: true, group: { OR: [{ type: 'Association' }, { type: 'Club' }] } },
      },
    },
  });

  if (nbBoard === 0) removeMemberFromMailingList(allBoardMailingList, email);
  else if (nbBoard >= 1) addMemberToMailingList(allBoardMailingList, email);

  if (nbPrez === 0) removeMemberFromMailingList(allTrezMailingList, email);
  else if (nbPrez >= 1) addMemberToMailingList(allTrezMailingList, email);

  if (nbTrez === 0) removeMemberFromMailingList(allPrezMailingList, email);
  else if (nbTrez >= 1) addMemberToMailingList(allPrezMailingList, email);
}

export async function addMemberToGroupMailingList(groupId: string, email: string) {
  const group = await prisma.group.findUniqueOrThrow({
    where: { uid: groupId },
    select: {
      uid: true,
      studentAssociation: { select: { school: { select: { internalMailDomain: true } } } },
    },
  });

  const mailingId = `${group.uid.replace(/-n7\b/, '')}.list.${group.studentAssociation?.school.internalMailDomain}`;
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
