import { ENV, prisma } from '#lib';
import { GroupType } from '@churros/db/prisma';

const apiUrl = ENV.MAILMAN_API_URL;
const apiToken = ENV.MAILMAN_API_TOKEN;

export async function removeMemberFromGroupMailingList(groupId: string, email: string) {
  const { mailingList } = await prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    select: { mailingList: true },
  });

  if (!mailingList) return;

  await removeMemberFromMailingList(mailingList, email);
}

async function removeMemberFromMailingList(mailing: string, email: string) {
  if (!apiUrl || !apiToken) {
    console.warn('Mailman API not configured, skipping mailing list removal');
    return;
  }
  const endpoint = `${apiUrl}/${mailing}/member/${email}`;
  await fetch(endpoint, {
    method: 'DELETE',
    headers: { Authorization: 'Basic ' + apiToken },
  });
}

const GROUP_TYPES_WITH_BOARDS = new Set<GroupType>([
  GroupType.Club,
  GroupType.Association,
  GroupType.StudentAssociationSection,
]);

export async function updateMemberBoardLists(
  memberID: string,
  groupId: string,
  groupType: GroupType,
) {
  if (!GROUP_TYPES_WITH_BOARDS.has(groupType)) return;

  const { studentAssociation, studentAssociationId } = await prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    select: {
      studentAssociation: {
        select: {
          allPrezMailingList: true,
          allTrezMailingList: true,
          allBoardMailingList: true,
        },
      },
      studentAssociationId: true,
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
          group: {
            OR: [{ type: 'Association' }, { type: 'Club' }],
            studentAssociationId: studentAssociationId,
          },
        },
      },
    },
  });
  const nbPrez = await prisma.user.count({
    where: {
      id: memberID,
      groups: {
        some: {
          president: true,
          group: {
            OR: [{ type: 'Association' }, { type: 'Club' }],
            studentAssociationId: studentAssociationId,
          },
        },
      },
    },
  });
  const nbTrez = await prisma.user.count({
    where: {
      id: memberID,
      groups: {
        some: {
          treasurer: true,
          group: {
            OR: [{ type: 'Association' }, { type: 'Club' }],
            studentAssociationId: studentAssociationId,
          },
        },
      },
    },
  });

  if (nbBoard === 0) await removeMemberFromMailingList(allBoardMailingList, email);
  else if (nbBoard >= 1) await addMemberToMailingList(allBoardMailingList, email);

  if (nbPrez === 0) await removeMemberFromMailingList(allPrezMailingList, email);
  else if (nbPrez >= 1) await addMemberToMailingList(allPrezMailingList, email);

  if (nbTrez === 0) await removeMemberFromMailingList(allTrezMailingList, email);
  else if (nbTrez >= 1) await addMemberToMailingList(allTrezMailingList, email);
}

export async function addMemberToGroupMailingList(groupId: string, email: string) {
  const { mailingList } = await prisma.group.findUniqueOrThrow({
    where: { uid: groupId },
    select: { mailingList: true },
  });

  if (!mailingList) return;

  await addMemberToMailingList(mailingList, email);
}

async function addMemberToMailingList(mailingId: string, email: string) {
  if (!apiUrl || !apiToken) {
    console.warn('Mailman API not configured, skipping mailing list addition');
    return;
  }
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
