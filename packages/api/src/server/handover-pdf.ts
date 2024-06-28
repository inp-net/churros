import { prisma } from '#lib';
import type { School } from '@centraverse/db/prisma';
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

let school: School | null;
let boardMembers: boardMemberType[] = [];
let studentAssociationPresident: { firstName: string; lastName: string } | null;
let studentAssociationTreasurer: { firstName: string; lastName: string } | null;

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'full',
});

console.info('Serving PDF generation of handover /print-handover/:uid');
api.get('/print-handover/:uid', async (req, res) => {
  // Reset du tableau de membres du bureau, evite d'avoir des bugs de doublon (bruh??)
  boardMembers = [];

  //recup le groupe qu'on etudie car on a que l'uid accessible (TODO : Faire un truc plus propre ?)
  const group = await prisma.group.findFirst({
    where: {
      uid: req.params.uid,
    },
    select: {
      id: true,
      uid: true,
      name: true,
      studentAssociationId: true,
    },
  });

  //Vérification qu'on a bien récup un groupe
  if (group === null) {
    res.status(502).send("Erreur : Le groupe n'a pas été trouvé");
    return;
  } else if (group.studentAssociationId === null) {
    // Verification que le groupe est bien associé à une asso étudiante associé au groupe
    res.status(502).send("Erreur : L'AE assosié au groupe n'a pas été trouvé");
    return;
  } else {
    //Si un groupe et une AE est trouvé, on peut générer le PDF

    //Recup les infos sur l'école
    school = await prisma.school.findFirst({
      where: {
        studentAssociations: {
          some: {
            id: group.studentAssociationId,
          },
        },
      },
    });

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
          },
        },
      },
    });

    studentAssociationPresident = await prisma.user.findFirst({
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

    if (studentAssociationPresident === null) {
      res
        .status(502)
        .send(
          "Erreur : L'AE au club associé n'a pas de président, génération de la fiche impossible",
        );
      return;
    }

    //On en select qu'un seul car on a besoin que d'un pour la fiche
    studentAssociationTreasurer = await prisma.user.findFirst({
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

    if (studentAssociationTreasurer === null) {
      res
        .status(502)
        .send(
          "Erreur : L'AE au club associé n'a aps de trésorier, génération de la fiche impossible",
        );
      return;
    }

    const clubPresident = boardMembersUser.filter((member) => member.groups[0]?.president);
    const clubTreasurer = boardMembersUser.filter((member) => member.groups[0]?.treasurer);

    if (clubPresident.length === 0 || clubTreasurer.length === 0) {
      res.status(502).send('Erreur : Ce club ne possède pas un trésorier et un président');
      return;
    }

    boardMembersUser = sortMemberByRole(boardMembersUser);

    for (const element of boardMembersUser) {
      const user = await prisma.groupMember.findFirst({
        where: {
          groupId: group.id,
          memberId: element?.id,
        },
        select: {
          title: true,
        },
      });

      boardMembers.push({ ...user, ...element });
    }

    if (school === null) {
      res.status(502).send("Erreur : L'école n'a pas été trouvé");
      return;
    }
  }

  const contentPDF = {
    info: {
      title: 'Fiche de passation - ' + group?.uid,
    },
    content: [
      buildHeaderDocumentInformation(school!),
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

function buildHeaderDocumentInformation(school: School) {
  const headerContent = [];
  if (school.pictureFile !== '') {
    headerContent.push({
      image: school.pictureFile,
      width: 150,
      margin: [0, 0, 0, 10],
    });
  }

  headerContent.push({
    text: [`Association des élèves ${school?.name}\n`, `${school?.address}\n`],
    margin: [0, 0, 0, 20],
    lineHeight: 1.4,
  });

  return headerContent;
}
