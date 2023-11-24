import { generatePDF } from './services/pdf';
import type { Event, Registration, Ticket } from '@prisma/client';
import fs from 'node:fs';

export function generateAndDownloadPDF(
  registration: Registration & { ticket: Ticket & { event: Event } },
) {
  console.info(process.cwd());
  try {
    // Generate the PDF using the registration data
    const pdf = generatePDF(registration);

    // Render the pdf and save it to a local file
    pdf.pipe(fs.createWriteStream('out.pdf'));
    pdf.end();
  } catch (error) {
    console.error('Error generating and downloading PDF:', error);
  }
}
