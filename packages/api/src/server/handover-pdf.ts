import { prisma } from '#lib';
import pdfMakePrinter from 'pdfmake';
import type { TFontDictionary } from 'pdfmake/interfaces';
import { api } from './express.js';

function boardMemberBuildInfo(
  boardMembers: {
    title: string;
    firstName: string;
    lastName: string;
    birthday: string;
    phone: string;
    email: string;
  }[],
  rightPos: number,
) {
  const body: string[][] = [];
  for (let i = rightPos; i < boardMembers.length; i = i + 2) {
    body.push(
      [boardMembers[i]!.title, ''],
      ['Nom', boardMembers[i]!.firstName],
      ['Prénom    ', boardMembers[i]!.lastName],
      ['Date de naissance', boardMembers[i]!.birthday],
      ['Téléphone', boardMembers[i]!.phone],
      ['Email', boardMembers[i]!.email],
      ['', ''],
    );
  }
  return body;
}

console.info('Serving PDF generation of handover /print-handover/:uid'); //A changer ??
api.get('/print-handover/:uid', async (req, res) => {
  //recup l'id car on a que l'uid accessible (TODO : Faire un truc plus propre ?)
  const group = await prisma.group.findFirst({
    where: {
      uid: req.params.uid,
    },
  });
  const id = group?.id;
  //récupération de l'ensemble des membres du bureau
  const boardMembersUser = await prisma.user.findMany({
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
    },
  });

  const boardMembers = [];

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
        image: '../app/static/student-associations/aen7_black.png',
        width: 150,
        margin: [0, 0, 0, 10],
      },
      {
        text: [
          'Association des élèves de l’ENSEEIHT\n',
          '2 rue Charles Camichel\n',
          '31071 Toulouse\n',
          'Tél. : 05 61 58 82 19\n',
          'E-mail : bde@bde.enseeiht.fr\n',
        ],
        margin: [0, 0, 0, 20],
      },
      {
        columnGap: 10,
        columns: [
          {
            layout: 'noBorders', // optional
            table: {
              headerRows: 1,
              heights: 8,
              width: [50, 50],
              body: boardMemberBuildInfo(boardMembers, 0),
            },
          },
          {
            layout: 'noBorders', // optional
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
          'Le nouveau bureau (président et trésorier), signataire, est officiellement responsable du club et du compte bancaire associé.',
        ],
        margin: [0, 20, 0, 40],
      },
      {
        layout: 'noBorders',
        table: {
          body: [
            [
              { text: ['Le président de l’AEn7, \n Simon Gournet'], alignment: 'center' },
              { text: ['Le trésorier de l’AEn7, \n Eliott Rousset'], alignment: 'center' },
              {
                text: [
                  `Le président du club Photo7, \n ${boardMembers[0]?.firstName} ${boardMembers[0]?.lastName}`,
                ],
                alignment: 'center',
              },
              {
                text: [
                  `Le trésorier du club Photo7, \n ${boardMembers[1]?.firstName} ${boardMembers[1]?.lastName}`,
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

  const printer = new pdfMakePrinter(fontes);
  const pdf = printer.createPdfKitDocument(contentPDF);

  const filestem = `Fiche passation - ${group?.uid}`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `filename="${encodeURIComponent(filestem)}.pdf"`);
  pdf.pipe(res);
  pdf.end();

  return pdf;
});

const fontes: TFontDictionary = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};
