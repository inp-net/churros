import { prisma } from '#lib';
import pdfMakePrinter from 'pdfmake';
import type { TFontDictionary } from 'pdfmake/interfaces';
import { api } from './express.js';

type textElement = {
  text: string | undefined;
  bold?: boolean;
  fontSize?: number;
  margin?: number[];
};

type boardMemberType = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  birthday: Date | null;
  phone: string;
  email: string;
  groups: {
    president: boolean;
    treasurer: boolean;
    vicePresident: boolean;
    secretary: boolean;
  }[];
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'full',
});

console.info('Serving PDF generation of handover /print-handover/:uid');
api.get('/print-handover/:uid', async (req, res) => {
  //recup l'id car on a que l'uid accessible (TODO : Faire un truc plus propre ?)
  const group = await prisma.group.findFirst({
    where: {
      uid: req.params.uid,
    },
    select: {
      id: true,
      uid: true,
      name: true,
    },
  });
  const id = group?.id;

  const AE = await prisma.group.findFirst({
    where: {
      uid: 'bde-n7',
    },
    select: {
      id: true,
    },
  });

  //récupération de l'ensemble des membres du bureau
  let boardMembersUser = await prisma.user.findMany({
    where: {
      groups: {
        some: {
          groupId: id,
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
          groupId: id,
        },
        select: {
          president: true,
          treasurer: true,
          vicePresident: true,
          secretary: true,
        },
      },
    },
  });

  const studentAssociationPresident = await prisma.user.findFirst({
    where: {
      groups: {
        some: {
          groupId: AE?.id,
          president: true,
        },
      },
    },
    select: {
      firstName: true,
      lastName: true,
    },
  });

  //On en select qu'un seul car on a besoin que d'un pour la fiche
  const studentAssociationTreasurer = await prisma.user.findFirst({
    where: {
      groups: {
        some: {
          groupId: AE?.id,
          treasurer: true,
        },
      },
    },
    select: {
      firstName: true,
      lastName: true,
    },
  });

  const boardMembers = [];
  boardMembersUser = sortMemberByRole(boardMembersUser);

  for (const element of boardMembersUser) {
    const user = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        memberId: element?.id,
      },
      select: {
        title: true,
      },
    });

    boardMembers.push({ ...user, ...element });
  }

  const contentPDF = {
    info: {
      title: 'Fiche de passation - ' + group?.uid,
    },
    content: [
      {
        //TODO : Changer l'image en fonction de l'école
        image: 'static/aen7_black.png',
        width: 150,
        margin: [0, 0, 0, 10],
      },
      {
        //info sur l'école, la encore faut les déhardcoder
        text: [
          'Association des élèves de l’ENSEEIHT\n',
          '2 rue Charles Camichel\n',
          '31071 Toulouse\n',
          'Tél. : 05 61 58 82 19\n',
          'E-mail : bde@bde.enseeiht.fr\n',
        ],
        margin: [0, 0, 0, 20],
        lineHeight: 1.4,
      },
      {
        columnGap: 10,
        columns: [
          //Tableau de gauche pour les infos sur les membres du bureau
          {
            layout: 'noBorders',
            table: {
              headerRows: 1,
              heights: 8,
              width: [50, 50],
              body: boardMemberBuildInfo(boardMembers, 0),
            },
          },
          //tableau de droite
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
      },
      {
        text: [
          'Le·a président·e et trésorier·e signataires sont officiellement responsables du club et du compte bancaire associé',
        ],
        margin: [0, 30, 0, 100],
      },
      {
        layout: 'noBorders',
        table: {
          body: [
            [
              //TODO : Déhardcoder les noms le jour où on aura les infos sur les prez et trésorier AE
              {
                text: [
                  `Le·a président·e de l’AEn7, \n ${studentAssociationPresident?.firstName} ${studentAssociationPresident?.lastName}`,
                ],
                alignment: 'center',
              },
              {
                text: [
                  `Le·a trésorier·e de l’AEn7, \n ${studentAssociationTreasurer?.firstName} ${studentAssociationTreasurer?.lastName}`,
                ],
                alignment: 'center',
              },
              {
                text: [
                  `Le·a président·e du club ${group?.name}, \n ${boardMembers[0]?.firstName} ${boardMembers[0]?.lastName}`,
                ],
                alignment: 'center',
              },
              {
                text: [
                  `Le·a trésorier·e du club ${group?.name}, \n ${boardMembers[1]?.firstName} ${boardMembers[1]?.lastName}`,
                ],
                alignment: 'center',
              },
            ],
          ],
        },
        fontSize: 10,
      },
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
});

const fonts: TFontDictionary = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};

function boardMemberBuildInfo(boardMembers: boardMemberType[], rightPos: number) {
  const body: textElement[][] = [];
  // Impair pour le tableau de gauche, pair pour celui de droite
  for (let i = rightPos; i < boardMembers.length; i = i + 2) {
    // On ajoute les infos de chaque membre du bureau dans l'un des tableaux
    body.push(
      [
        {
          text: boardMembers[i]?.title == undefined ? '' : boardMembers[i]?.title,
          bold: true,
          fontSize: 16,
          margin: [0, 0, 0, 5],
        },
        { text: '' },
      ],
      [{ text: 'Nom' }, { text: boardMembers[i]?.firstName }],
      [{ text: 'Prénom' }, { text: boardMembers[i]?.lastName }],
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

//Fonction de tri des membres du bureau en fonction de leur rôles. Prez > Trez > VP > Secrétaire
function sortMemberByRole(boardMembers: boardMemberType[]) {
  //recup tout les membres du bureau selon leur rôles
  const sortedMembers: boardMemberType[] = [];
  const presidentList = boardMembers.filter((member) => member.groups[0]?.president);
  const treasurerList = boardMembers.filter((member) => member.groups[0]?.treasurer);
  const vicePresidentList = boardMembers.filter((member) => member.groups[0]?.vicePresident);
  const secretaryList = boardMembers.filter((member) => member.groups[0]?.secretary);

  //renvoie la liste des membres dans l'ordre Prez > Trez > VP > Secrétaire
  return sortedMembers.concat(presidentList, treasurerList, vicePresidentList, secretaryList);
}
