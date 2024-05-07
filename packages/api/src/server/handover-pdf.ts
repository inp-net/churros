import { prisma } from '#lib';
import pdfMakePrinter from 'pdfmake';
import type { TFontDictionary } from 'pdfmake/interfaces';
import { api } from './express.js';

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
  const president = await prisma.user.findFirst({
    include: {
      groups: {
        where: {
          groupId: id,
          president: true,
        }
      }
    }
  });

  const vicePresidents = await prisma.user.findMany({
    include: {
      groups: {
        where: {
          vicePresident: true,
          groupId: id,
        }
      }
    }
  });

  //plusieurs secrétaire possible dans un bureau
  const secretaries = await prisma.user.findMany({
    include: {
      groups: {
        where: {
          vicePresident: true,
          groupId: id,
        }
      }
    }
  });

  //Plusieurs trez dans un brueau
  const treasurers = await prisma.user.findMany({
    include: {
      groups: {
        where: {
          vicePresident: true,
          groupId: id,
        }
      }
    }
  });

  //Obligation d'avoir un Président et un Trésorier, si on les trouve pas erreur 404
  if (!president || !treasurers) return res.status(404).send('Not found');

  //Liste de l'ensemble des users membres avec leur roles
  let boardMembers = new Array;
  
  //ajout des membres à la liste, president ensuite les autres roles
  boardMembers.push( { role: "Président", ...president } )

  for(let i=0; i < treasurers.length; i++) {
    boardMembers.push( { role: "Trésorier", ...treasurers[i]});
  }
  for(let i=0; i < vicePresidents.length; i++) {
    boardMembers.push( { role: "Vice-Président", ...vicePresidents[i]});
  }
  for(let i=0; i < secretaries.length; i++) {
    boardMembers.push( { role: "Secrétaire", ...secretaries[i]});
  }

  /*
  let rightMemberColumn = new Array;
  let leftMemberColumn = new Array;

  //Génération des 2 colonnes des membres du PDF
  for(let i = 0; i < boardMembers.length; i = i+2) {
    leftMemberColumn.push(boardMembers[i]);
    rightMemberColumn.push(boardMembers[i+1]);
  }*/

  function boardMemberBuildInfo(boardMembers : {
    role : string, firstName : string, lastName : string, birthday : string, phone : string}[]) {

      let body = new Array;

      for(let i = 0; i < boardMembers.length; i++){
        body.push( [
            [{ text : boardMembers[i]?.role, style: 'header' }, ""],
            ["Nom", boardMembers[i]?.firstName],
            ["Prénom", boardMembers[i]?.lastName]
          ]
        )
      }
      return body

  }

  const contentPDF = {
    info: {
      title: 'Fiche de passation - ' + group?.uid,
    },
    content: [
      {
        image: "../app/static/student-associations/aen7_black.png",
        width: 150,
        margin:[0, 0, 0, 10],
      },
      {
        text: [
          'Association des élèves de l’ENSEEIHT\n',
          '2 rue Charles Camichel\n',
          '31071 Toulouse\n',
          'Tél. : 05 61 58 82 19\n',
          'E-mail : bde@bde.enseeiht.fr\n'
        ],
        margin:[0, 0, 0, 20],
      },
      {
        columns: [
          {
            columns: [
              {
                text: [
                  'Nom\n',
                  'Prénom\n',
                  'Date de naissance\n',
                  'Téléphone\n',
                  'Mail\n'
                ]
              },
              {
                text: [
                  `${president?.lastName}\n`,
                  `${president?.firstName}\n`,
                  `${president?.birthday}\n`,
                  `${president?.phone}\n`,
                ]
              },
            ],
            fontSize: 11,
          },
          {
            text: [
              `Nom : ${treasurers[0]?.lastName}`
            ]
          }
        ],
      },
      {
        layout: 'noBorders', // optional
        table: {
          // headers are automatically repeated if the table spans over multiple pages
          // you can declare how many rows should be treated as headers
          headerRows: 1,  
          body: boardMemberBuildInfo(boardMembers)
        }
      },
    ],
    defaultStyle:{
      font: 'SpaceMono',
    }
  }
    
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
