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

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'full',
});

function boardMemberBuildInfo(
  boardMembers: {
    firstName: string;
    lastName: string;
    birthday: Date | null;
    phone: string;
    email: string;
    title?: string;
  }[],
  rightPos: number,
) {
  
  const body: textElement[][] = [];
  // Impair pour le tableau de gauche, pair pour celui de droite
  for (let i = rightPos; i < boardMembers.length; i = i + 2) {
    // On ajoute les infos de chaque membre du bureau dans l'un des tableaux
    body.push(
      [{text: (boardMembers[i]?.title != undefined ? boardMembers[i]?.title : ""), bold: true, fontSize: 16, margin: [0, 0, 0, 5] }, {text : ''}],
      [{text: 'Nom'}, {text: boardMembers[i]?.firstName}],
      [{text: 'Prénom'}, {text: boardMembers[i]?.lastName}],
      [{text: 'Date de naissance'}, {text: boardMembers[i]?.birthday != null ? dateFormatter.format((boardMembers[i]?.birthday!)) : "" }],
      [{text:'Téléphone'}, {text: boardMembers[i]?.phone}],
      [{text:'Email', margin: [0, 0, 0, 15]}, {text:boardMembers[i]?.email}],

    );
  }
  return body;
}

console.info('Serving PDF generation of handover /print-handover/:uid');
api.get('/print-handover/:uid', async (req, res) => {
  //recup l'id car on a que l'uid accessible (TODO : Faire un truc plus propre ?)
  const group = await prisma.group.findFirst({
    //w
    where: {
      uid: req.params.uid,
    },
    select: {
      id: true,
      uid: true,
      name: true,
    }
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
        //TODO : Changer l'image en fonction de l'école
        image: '../app/static/student-associations/aen7_black.png',
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
          'Le nouveau bureau (président et trésorier), signataire, est officiellement responsable du club et du compte bancaire associé.',
        ],
        margin: [0, 30, 0, 100],
      },
      {
        layout: 'noBorders',
        table: {
          body: [
            [ 
              //TODO : Déhardcoder les noms le jour où on aura les infos sur les prez et trésorier AE
              { text: ['Le président de l’AEn7, \n Pablo Arbona'], alignment: 'center' },
              { text: ['Le trésorier de l’AEn7, \n Raphael Registo'], alignment: 'center' },
              {
                text: [
                  `Le président du club ${group?.name}, \n ${boardMembers[0]?.firstName} ${boardMembers[0]?.lastName}`,
                ],
                alignment: 'center',
              },
              {
                text: [
                  `Le trésorier du club ${group?.name}, \n ${boardMembers[1]?.firstName} ${boardMembers[1]?.lastName}`,
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
