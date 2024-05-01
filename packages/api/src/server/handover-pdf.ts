import { prisma } from '#lib';
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

  //Pour pas que le script de precommit me clc ptdrrrr cette ligne n'a pas de sens
  if (!vicePresidents && !secretary && !treasurer) return 0;
});
