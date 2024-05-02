import { prisma } from '#lib';
import pdfMakePrinter from 'pdfmake';
import type { TFontDictionary } from 'pdfmake/interfaces';
import { api } from './express.js';

console.info('Serving PDF generation of handover /print-handover/:group.uid'); //A changer ??
api.get('/print-handover/:group.uid', async (req, res) => {
  //recup l'id car on a que l'uid accessible (TODO : Faire un truc plus propre ?)
  const group = await prisma.group.findFirst({
    where: {
      uid: req.params.group,
    },
  });
  const id = group?.id;

  //récupération de l'ensemble des membres du bureau
  const president = await prisma.groupMember.findFirst({
    where: {
      groupId: id,
      president: true,
    },
  });

  const vicePresidents = await prisma.groupMember.findMany({
    where: {
      groupId: id,
      vicePresident: true,
    },
  });

  //plusieurs secrétaire possible dans un bureau
  const secretary = await prisma.groupMember.findMany({
    where: {
      groupId: id,
      secretary: true,
    },
  });

  //Plusieurs trez dans un brueau
  const treasurer = await prisma.groupMember.findMany({
    where: {
      groupId: id,
      treasurer: true,
    },
  });

  //Obligation d'avoir un Président et un Trésorier, si on les trouve pas erreur 404
  if (!president || !treasurer) return res.status(404).send('Not found');

  const contentPDF = {
    info: {
      //c'est fucked up c'est pour dire tg au precommit
      vicePresidents,
      secretary,
      title: 'Fiche de passation - ' + group?.uid,
    },
    content: ['Coucou les amis'],
  };
  const printer = new pdfMakePrinter(fonts);
  const pdf = printer.createPdfKitDocument(contentPDF);

  const filestem = `Fiche passation - ${group?.uid}`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `filename="${encodeURIComponent(filestem)}.pdf"`);
  pdf.pipe(res);
  pdf.end();
});

const fonts: TFontDictionary = {
  SpaceGrotesk: {
    normal: 'static/fonts/SpaceGrotesk-Regular.woff',
    bold: 'static/fonts/SpaceGrotesk-Bold.woff',
    italics: 'static/fonts/SpaceGrotesk-Italic.woff',
    bolditalics: 'static/fonts/SpaceGrotesk-BoldItalic.woff',
  },
  SpaceMono: {
    normal: 'static/fonts/SpaceMono-Regular.woff',
    bold: 'static/fonts/SpaceMono-Bold.woff',
    italics: 'static/fonts/SpaceMono-Italic.woff',
    bolditalics: 'static/fonts/SpaceMono-BoldItalic.woff',
  },
};
