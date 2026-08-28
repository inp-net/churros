import { log, prisma } from '#lib';
import type { $Enums } from '@churros/db/prisma';
import pdfMakePrinter from 'pdfmake';
import type { TFontDictionary } from 'pdfmake/interfaces';
import { api } from './express.js';

type TextElement = {
  text: string | undefined;
  bold?: boolean;
  fontSize?: number;
  margin?: number[];
};

type BoardMember = {
  id: string;
  firstName: string;
  lastName: string;
  birthday: Date | null;
  phone: string;
  email: string;
  groups: {
    president: boolean;
    treasurer: boolean;
    vicePresident: boolean;
    secretary: boolean;
    title?: string;
    createdAt: Date;
  }[];
};

type StudentAssociationBoardMember = {
  firstName: string;
  lastName: string;
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'full',
});

//TODO : Infos de l'écoles faudrait les avoir dans la db
const SCHOOL_INFO = {
  image: 'static/aen7_black.png',
  name: 'Association des élèves de l’ENSEEIHT',
  address: '2 rue Charles Camichel',
  postal: '31071 Toulouse',
  phone: '05 61 58 82 19',
  email: 'bde@bde.enseeiht.fr',
};

const fonts: TFontDictionary = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};

async function getHandoverData(uid: string) {
  const group = await prisma.group.findFirst({
    where: {
      uid: uid,
    },
    select: {
      id: true,
      uid: true,
      name: true,
      type: true,
      studentAssociation: {
        select: {
          boardId: true,
        },
      },
    },
  });

  if (!group) {
    return null;
  }

  const aeBoardId = group?.studentAssociation?.boardId ?? undefined;

  let studentAssociationPresident: StudentAssociationBoardMember | null = null;
  let studentAssociationTreasurer: StudentAssociationBoardMember | null = null;

  if (group.type !== 'Association' && aeBoardId) {
    const data = await prisma.user.findMany({
      where: {
        groups: {
          some: {
            groupId: aeBoardId,
            OR: [{ president: true }, { treasurer: true }],
          },
        },
      },
      select: {
        firstName: true,
        lastName: true,
        groups: {
          where: {
            groupId: aeBoardId,
          },
          select: {
            president: true,
            treasurer: true,
          },
        },
      },
    });

    studentAssociationPresident = data.find((user) => user.groups[0]?.president) || null;
    studentAssociationTreasurer = data.find((user) => user.groups[0]?.treasurer) || null;
  }

  const boardMembersUser: BoardMember[] = sortMemberByRole(
    await prisma.user.findMany({
      where: {
        groups: {
          some: {
            groupId: group.id,
            OR: [
              { president: true },
              { vicePresident: true },
              { secretary: true },
              { treasurer: true },
            ],
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        birthday: true,
        phone: true,
        email: true,
        groups: {
          where: {
            groupId: group.id,
          },
          select: {
            president: true,
            treasurer: true,
            vicePresident: true,
            secretary: true,
            title: true,
            createdAt: true,
          },
        },
      },
    }),
  );

  return { group, boardMembersUser, studentAssociationPresident, studentAssociationTreasurer };
}

//Fonction de tri des membres du bureau en fonction de leur rôles. Prez > Trez > VP > Secrétaire
function sortMemberByRole(boardMembers: BoardMember[]) {
  const byDate = (a: BoardMember, b: BoardMember) => {
    const dateA = a.groups[0]?.createdAt ? new Date(a.groups[0].createdAt).getTime() : 0;
    const dateB = b.groups[0]?.createdAt ? new Date(b.groups[0].createdAt).getTime() : 0;
    return dateA - dateB;
  };

  return [
    ...boardMembers.filter((m) => m.groups[0]?.president).sort(byDate),
    ...boardMembers.filter((m) => m.groups[0]?.treasurer).sort(byDate),
    ...boardMembers.filter((m) => m.groups[0]?.vicePresident).sort(byDate),
    ...boardMembers.filter((m) => m.groups[0]?.secretary).sort(byDate),
  ];
}

function buildHeader() {
  return {
    stack: [
      {
        image: SCHOOL_INFO.image,
        width: 150,
        margin: [0, 0, 0, 10],
      },
      {
        text: [
          `${SCHOOL_INFO.name}\n`,
          `${SCHOOL_INFO.address}\n`,
          `${SCHOOL_INFO.postal}\n`,
          `Tél. : ${SCHOOL_INFO.phone}\n`,
          `E-mail : ${SCHOOL_INFO.email}\n`,
        ],
        margin: [0, 0, 0, 20],
        lineHeight: 1.4,
      },
    ],
  };
}

function boardMemberBuildInfo(boardMembers: BoardMember[], rightPos: number) {
  const body: TextElement[][] = [];
  // Impair pour le tableau de gauche, pair pour celui de droite
  for (let i = rightPos; i < boardMembers.length; i = i + 2) {
    // On ajoute les infos de chaque membre du bureau dans l'un des tableaux
    body.push(
      [
        {
          text:
            boardMembers[i]?.groups[0]?.title == undefined ? '' : boardMembers[i]?.groups[0]?.title,
          bold: true,
          fontSize: 16,
          margin: [0, 0, 0, 5],
        },
        { text: '' },
      ],
      [{ text: 'Nom' }, { text: boardMembers[i]?.lastName }],
      [{ text: 'Prénom' }, { text: boardMembers[i]?.firstName }],
      [
        { text: 'Date de naissance' },
        {
          text: boardMembers[i]?.birthday ? dateFormatter.format(boardMembers[i]!.birthday!) : '',
        },
      ],
      [{ text: 'Téléphone' }, { text: boardMembers[i]?.phone }],
      [{ text: 'Email', margin: [0, 0, 0, 15] }, { text: boardMembers[i]?.email }],
    );
  }
  return body;
}

function buildBoardMembersTables(boardMembers: BoardMember[]) {
  return {
    columnGap: 10,
    columns: [
      {
        layout: 'noBorders',
        table: {
          headerRows: 1,
          heights: 8,
          width: [50, 50],
          body: boardMemberBuildInfo(boardMembers, 0),
        },
      },
      {
        layout: 'noBorders',
        table: {
          headerRows: 1,
          heights: 8,
          width: [70, 70],
          body: boardMemberBuildInfo(boardMembers, 1),
        },
      },
    ],
    fontSize: 10,
  };
}

function buildResponsibleText(groupType: $Enums.GroupType) {
  let text =
    'Le·a président·e et trésorier·e signataires sont officiellement responsables du club et du compte bancaire associé';
  if (groupType === 'Association') {
    text =
      'Le·a président·e et trésorier·e signataires sont officiellement responsables de l’association et du compte bancaire associé';
  }
  return {
    text: [text],
    margin: [0, 30, 0, 100],
  };
}

function buildSignatureRow(
  groupName: string,
  groupType: string,
  boardMembers: BoardMember[],
  studentAssociationPresident: StudentAssociationBoardMember | null,
  studentAssociationTreasurer: StudentAssociationBoardMember | null,
) {
  const signature = (role: string, entity: string, firstName: string, lastName: string) => ({
    text: [`${role} ${entity}, \n ${firstName} ${lastName}`],
    alignment: 'center',
  });

  const row =
    groupType === 'Association'
      ? [
          signature(
            'Le·a président·e de l’association',
            groupName,
            boardMembers[0]?.firstName ?? '',
            boardMembers[0]?.lastName ?? '',
          ),
          signature(
            'Le·a trésorier·e de l’association',
            groupName,
            boardMembers[1]?.firstName ?? '',
            boardMembers[1]?.lastName ?? '',
          ),
        ]
      : [
          signature(
            'Le·a président·e de',
            'l’AEn7',
            studentAssociationPresident?.firstName ?? '',
            studentAssociationPresident?.lastName ?? '',
          ),
          signature(
            'Le·a trésorier·e de',
            'l’AEn7',
            studentAssociationTreasurer?.firstName ?? '',
            studentAssociationTreasurer?.lastName ?? '',
          ),
          signature(
            'Le·a président·e du club',
            groupName,
            boardMembers[0]?.firstName ?? '',
            boardMembers[0]?.lastName ?? '',
          ),
          signature(
            'Le·a trésorier·e du club',
            groupName,
            boardMembers[1]?.firstName ?? '',
            boardMembers[1]?.lastName ?? '',
          ),
        ];

  return {
    layout: 'noBorders',
    table: { widths: row.map(() => '*'), body: [row] },
    fontSize: 10,
  };
}

console.info('Serving PDF generation of handover /print-handover/:uid');
api.get('/print-handover/:uid', async (req, res) => {
  const data = await getHandoverData(req.params.uid);

  //Une erreur parce que quand meme
  if (!data) {
    return res.status(404).json({ error: 'Groupe non trouvé' });
  }

  const { group, boardMembersUser, studentAssociationPresident, studentAssociationTreasurer } =
    data;

  log('groups', 'print-handover', { group }, group.id);

  try {
    const contentPDF = {
      info: {
        title: 'Fiche de passation - ' + group.uid,
      },
      content: [
        buildHeader(),
        buildBoardMembersTables(boardMembersUser),
        buildResponsibleText(group?.type ?? ''),
        buildSignatureRow(
          group.name,
          group.type,
          boardMembersUser,
          studentAssociationPresident,
          studentAssociationTreasurer,
        ),
      ],
      defaultStyle: {
        font: 'Helvetica',
      },
    };

    const printer = new pdfMakePrinter(fonts);
    // @ts-expect-error pdfmake est typé bizarrement, la génération fonctionne
    const pdf = printer.createPdfKitDocument(contentPDF);

    const filestem = `Fiche passation - ${group?.uid}`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `filename="${encodeURIComponent(filestem)}.pdf"`);
    pdf.pipe(res);
    pdf.end();

    return pdf;
  } catch {
    return res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
  }
});
