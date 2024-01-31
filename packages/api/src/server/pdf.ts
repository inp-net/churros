import { prisma } from '#lib';
import { api } from './express.js';
import { generatePDF } from './services/pdf.js';

api.get('/print-booking/:pseudoID', async (req, res) => {
  const id = `r:${req.params.pseudoID.toLowerCase()}`;

  const registration = await prisma.registration.findUnique({
    where: { id },
    include: {
      ticket: {
        include: {
          event: {
            include: {
              group: true,
            },
          },
        },
      },
      author: true,
    },
  });

  if (!registration) return res.status(404).send('Not found');

  const pdf = generatePDF(registration);

  const filestem = `${registration.ticket.event.group.name} ${registration.ticket.event.title} - ${registration.ticket.name}`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `filename="${encodeURIComponent(filestem)}.pdf"`);
  pdf.pipe(res);
  pdf.end();

  return res.status(200);
});
