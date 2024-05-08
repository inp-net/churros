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
  }[],
) {
  const body = [];

  for (const boardMember of boardMembers) {
    body.push(
      { text: boardMember?.title, style: 'header' },
      { text: ['Nom', boardMember?.firstName] },
      { text: ['Prénom    ', boardMember?.lastName], margin: [0, 0, 0, 20] },
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

  //Obligation d'avoir un Président et un Trésorier, si on les trouve pas erreur 404
  //if (!president || !treasurers) return res.status(404).send('Not found');

  /*
  let rightMemberColumn = new Array;
  let leftMemberColumn = new Array;

  //Génération des 2 colonnes des membres du PDF
  for(let i = 0; i < boardMembers.length; i = i+2) {
    leftMemberColumn.push(boardMembers[i]);
    rightMemberColumn.push(boardMembers[i+1]);
  }*/

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
          boardMembers[0]?.title,
        ],
        margin: [0, 0, 0, 20],
      },
      {
        text: [`${boardMembers.length}\n`],
      },
      {
        columns: [
          {
            columns: [
              {
                text: ['Nom\n', 'Prénom\n', 'Date de naissance\n', 'Téléphone\n', 'Mail\n'],
              },
              {
                text: [
                  //`${president?.lastName}\n`,
                  //`${president?.firstName}\n`,
                  //`${president?.birthday}\n`,
                  //`${president?.phone}\n`,
                ],
              },
            ],
            fontSize: 11,
          },
          {
            text: [
              //`Nom : ${treasurers[0]?.lastName}`
            ],
          },
        ],
      },
      {
        layout: 'noBorders', // optional
        table: {
          // headers are automatically repeated if the table spans over multiple pages
          // you can declare how many rows should be treated as headers
          headerRows: 1,
          body: [boardMemberBuildInfo(boardMembers)],
        },
      },
    ],
    defaultStyle: {
      font: 'SpaceMono',
    },
  };

  const printer = new pdfMakePrinter(fonts);
  const pdf = printer.createPdfKitDocument(contentPDF);

  const filestem = `Fiche passation - ${group?.uid}`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `filename="${encodeURIComponent(filestem)}.pdf"`);
  pdf.pipe(res);
  pdf.end();

  return pdf;
});

const fonts: TFontDictionary = {
  SpaceMono: {
    normal: 'static/fonts/SpaceMono-Regular.woff',
    bold: 'static/fonts/SpaceMono-Bold.woff',
    italics: 'static/fonts/SpaceMono-Italic.woff',
    bolditalics: 'static/fonts/SpaceMono-BoldItalic.woff',
  },
};
