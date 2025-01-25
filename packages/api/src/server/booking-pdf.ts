import { ENV, prisma } from '#lib';
import type { Prisma } from '@churros/db/prisma';
import pdfMakePrinter from 'pdfmake';
import type { TFontDictionary } from 'pdfmake/interfaces';
import { api } from './express.js';

const registrationInclude = {
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
  internalBeneficiary: true,
} as const satisfies Prisma.RegistrationInclude;

console.info(`Serving PDF generation of bookings /print-booking/:pseudoID`);
api.get('/print-booking/:pseudoID', async (req, res) => {
  const id = `r:${req.params.pseudoID.toLowerCase()}`;

  const registration = await prisma.registration.findUnique({
    where: { id },
    include: registrationInclude,
  });

  if (!registration) return res.status(404).send('Not found');

  try {
    const pdf = generatePDF(registration);

    const filestem = `${registration.ticket.event.group.name} ${registration.ticket.event.title} - ${registration.ticket.name}`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `filename="${encodeURIComponent(filestem)}.pdf"`);
    pdf.pipe(res);
    pdf.end();

    return res.status(200);
  } catch (error) {
    return res
      .status(500)
      .send(error?.toString() ?? 'Impossible de générer de PDF pour cette réservation');
  }
});

export function generatePDF(
  registration: Prisma.RegistrationGetPayload<{ include: typeof registrationInclude }>,
) {
  if (!registration.ticket.event.startsAt || !registration.ticket.event.endsAt)
    throw new Error('Missing event dates');

  // playground requires you to assign document definition to a variable called dd
  const DISPLAY_PAYMENT_METHODS = {
    Cash: 'Espèces',
    Check: 'Chèque',
    Card: 'Carte bancaire',
    Transfer: 'Virement',
    Lydia: 'Lydia',
    Other: 'Autre',
  };

  const dd = {
    info: {
      title: registration.ticket.event.title + ' - ' + registration.ticket.name,
    },
    content: [
      {
        svg: '<svg width="128" height="60" viewBox="0 0 3283 861" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_31_30)"><path d="M448.755 712.249L0 634.015V783.962L448.755 862.196V712.249Z" fill="#843E2A"/><path d="M872.517 610.111L449.84 713.335V861.109L872.517 742.129V610.111Z" fill="#FBBE1F"/><path d="M449.295 712.249L2.16992 632.929L449.295 553.066L879.578 607.394L449.295 712.249Z" fill="#CA7E17"/><path d="M278.747 115.445L274.181 75.2623L594.897 7.40822V45.839L278.747 115.445Z" fill="#CA7E17" stroke="#CA7E17" stroke-width="7.60601"/><path d="M275.169 115.81L275.589 123.305C295.481 125.417 343.399 138.746 374.716 174.719L374.741 174.698C375.271 175.194 376.043 175.696 376.382 175.83L389.605 180.237L384.464 174.332C385.382 174.105 386.404 173.855 387.524 173.582C393.487 172.128 402.198 170.042 413.019 167.461C418.201 166.225 423.866 164.875 429.942 163.428C449.233 158.832 472.673 153.249 497.983 147.166C564.532 131.173 644.1 111.709 695.327 97.656L699.502 96.5106L697.828 92.5178C696.345 88.9818 692.878 84.5681 688.063 79.9979C683.157 75.3408 676.57 70.2547 668.479 65.4319C652.36 55.8235 630.136 47.1792 603.124 45.1284C603.101 45.1245 603.082 45.1214 603.066 45.1188C602.669 45.0554 602.335 45.0658 602.226 45.0693C601.933 45.0786 601.629 45.1132 601.396 45.1429C600.889 45.2077 600.199 45.3192 599.376 45.4638C597.71 45.7564 595.284 46.2223 592.195 46.8388C586.008 48.0738 577.063 49.9336 566.005 52.2735C543.886 56.9544 513.267 63.5674 479.253 70.9723C411.223 85.7827 329.59 103.766 275.169 115.81Z" fill="#FBBE1F" stroke="#FBBE1F" stroke-width="7.60601"/><path d="M726.373 60.3047L392.795 128.215C434.519 156.032 467.406 235.424 478.634 271.643L805.149 199.386C797.326 144.623 749.372 83.8471 726.373 60.3047Z" fill="#FBBE1F" stroke="#FBBE1F" stroke-width="7.60601" stroke-linejoin="bevel"/><path d="M447.401 282.053L443.481 282.907L444.544 286.776C460.02 343.094 457.795 402.789 454.764 425.432L454.047 430.79L459.332 429.655C514.114 417.883 596.315 400.199 664.875 385.403C699.154 378.005 730.025 371.329 752.354 366.475C763.518 364.049 772.55 362.076 778.806 360.697C781.933 360.008 784.373 359.465 786.04 359.087C786.872 358.899 787.523 358.749 787.975 358.641C788.09 358.614 788.197 358.588 788.295 358.564C788.388 358.541 788.472 358.519 788.547 358.5C788.617 358.482 788.716 358.455 788.817 358.425C788.861 358.411 788.961 358.381 789.081 358.336C789.146 358.311 789.306 358.244 789.403 358.199C789.577 358.11 790.116 357.756 790.454 357.455L791.38 356.53L791.54 355.231C799.015 294.55 785.888 235.503 778.325 213.369L777.229 210.16L773.916 210.882L447.401 282.053Z" fill="#FBBE1F" stroke="#FBBE1F" stroke-width="7.60601"/><path d="M311.867 623.545L312.31 627.775L316.464 626.864L648.412 554.064L651.742 553.334L651.379 549.944L646.489 504.308L646.039 500.103L641.905 500.996L309.957 572.71L306.622 573.43L306.977 576.823L311.867 623.545Z" fill="#FBBE1F" stroke="#FBBE1F" stroke-width="7.60601"/><path d="M819.275 371.608L493.846 444.408C483.415 518.73 448.573 563.388 432.455 576.427C540.026 553.066 756.037 506.56 759.514 507.43C796.457 483.96 814.748 407.103 819.275 371.608Z" fill="#FBBE1F" stroke="#FBBE1F" stroke-width="7.60601" stroke-linejoin="bevel"/><path d="M95.0762 252.085L130.39 266.21C130.39 261.864 134.555 244.117 136.366 238.503L95.0762 252.085Z" fill="#FBBE1F"/><path d="M492.758 443.865L458.531 427.023L787.763 354.766L819.273 371.608L492.758 443.865Z" fill="#CA7E17"/><path d="M130.387 266.754C135.82 237.235 154.509 174.612 185.802 160.269C184.933 159.4 166.606 132.381 157.551 118.98C173.669 100.689 218.834 65.7376 270.555 72.257C270.12 71.3878 273.634 103.043 275.444 118.98C297.898 122.058 349.757 137.014 377.575 172.212C377.839 171.196 388.081 143.128 393.338 128.759C418.329 141.254 460.053 200.473 479.177 272.187C478.308 271.317 457.808 280.517 447.666 285.225C454.548 308.949 466.247 370.63 457.989 427.566C458.858 425.393 481.169 437.165 492.216 443.322C487.688 477.549 469.289 551.87 431.911 575.34L406.376 537.854C396.597 550.349 364.109 575.34 312.388 575.34C311.953 575.34 314.742 607.938 316.191 624.236C284.68 621.701 215.792 606.416 192.322 565.561C191.887 565.127 205.179 539.665 211.88 526.988C192.684 506.162 151.901 453.753 142.339 410.725C142.774 409.855 121.513 419.417 110.829 424.307C98.152 394.245 77.5795 317.931 96.7032 253.171C96.2686 252.302 118.978 261.864 130.387 266.754Z" fill="#843E2A"/><path d="M377.582 172.222C349.766 137.017 297.9 122.058 275.444 118.98C273.634 103.043 270.12 71.3878 270.555 72.257C218.834 65.7376 173.669 100.689 157.551 118.98C166.606 132.381 184.933 159.4 185.802 160.269C154.509 174.612 135.82 237.235 130.387 266.754C118.978 261.864 96.2686 252.302 96.7032 253.171C77.5795 317.931 98.152 394.245 110.829 424.307C121.513 419.417 142.774 409.855 142.339 410.725C151.901 453.753 192.684 506.162 211.88 526.988C205.179 539.665 191.887 565.127 192.322 565.561C215.792 606.416 284.68 621.701 316.191 624.236C314.742 607.938 311.953 575.34 312.388 575.34C364.109 575.34 396.597 550.349 406.377 537.854L431.911 575.34C469.289 551.87 487.688 477.549 492.216 443.322C481.169 437.165 458.858 425.393 457.989 427.566C466.247 370.63 454.548 308.949 447.666 285.225C457.808 280.517 478.308 271.317 479.177 272.187C460.053 200.473 418.329 141.254 393.338 128.759M377.582 172.222C377.148 173.091 387.905 143.609 393.338 128.759M377.582 172.222L393.338 128.759" stroke="#843E2A" stroke-width="7.60601"/><path d="M222.573 294.676L219.283 295.83L220.148 299.208L253.832 430.683L254.811 434.507L258.595 433.386L355.844 404.592L359.44 403.527L358.425 399.916L320.395 264.638L319.298 260.737L315.475 262.078L222.573 294.676Z" fill="#CA7E17" stroke="#CA7E17" stroke-width="7.60601"/><path d="M775.813 214.598L448.211 284.682L479.178 271.1L805.693 199.929L775.813 214.598Z" fill="#CA7E17" stroke="#CA7E17" stroke-width="7.60601" stroke-linejoin="bevel"/><path d="M575.884 0L260.777 70.084L272.186 72.2571L599.245 2.71643L575.884 0Z" fill="#FBBE1F" stroke="#FBBE1F" stroke-width="5.43287"/><path d="M1462.53 231.898C1417.82 190.688 1358.11 165.518 1292.51 165.518C1153.92 165.518 1041.58 277.863 1041.58 416.449C1041.58 555.034 1153.92 667.379 1292.51 667.379C1360.79 667.379 1422.71 640.104 1467.95 595.852" stroke="black" stroke-width="72"/><path d="M1551.16 162V694.349V532.533C1551.16 458.06 1610.87 397.687 1684.51 397.687C1758.16 397.687 1817.86 458.06 1817.86 532.533V694.349" stroke="black" stroke-width="72"/><path d="M2181.27 370L2181.27 531.815C2181.27 606.289 2120.9 666.661 2046.42 666.661C1971.95 666.661 1911.58 606.288 1911.58 531.815L1911.58 370" stroke="black" stroke-width="72"/><circle cx="2828.08" cy="544.5" r="142.5" stroke="black" stroke-width="72"/><path d="M2282.58 701V408H2435.58" stroke="black" stroke-width="72"/><path d="M2498.58 701V408H2655.58" stroke="black" stroke-width="72"/><path d="M3242.58 479.5C3230.08 448 3190.98 414.5 3146.58 414.5C3113.58 414.5 3058.88 433.9 3066.08 489.5C3067.37 499.5 3073.58 539.861 3146.58 550C3154.08 551.042 3248.08 566.5 3237.08 635C3237.08 635 3226.08 695.5 3146.58 693.5C3122.91 694 3069.68 680.5 3046.08 622.5" stroke="black" stroke-width="72"/></g><defs><clipPath id="clip0_31_30"><rect width="3283" height="861" fill="white"/></clipPath></defs></svg>',
      },
      {
        columnGap: 5,
        columns: [
          { qr: registration.ticketId, width: 128 },
          {
            columns: [
              {
                text: [
                  'Code :\n',
                  'Bénéficiaire :\n',
                  'Payé par :\n',
                  'Évènement :\n',
                  'Place :\n',
                  'Prix :\n',
                  'Méthode de paiement :\n',
                  'Date de réservation :\n',
                  registration.ticket.event.location === '' ? '' : 'Lieu :\n',
                ],
                width: 200,
              },
              {
                text: [
                  {
                    text: registration.id.replace(/^r:/, '').toUpperCase() + '\n',
                    link: new URL(
                      `/bookings/${registration.id}`,
                      ENV.PUBLIC_FRONTEND_ORIGIN,
                    ).toString(),
                    style: {
                      font: 'SpaceMono',
                      decoration: 'underline',
                      color: '#1d4ed8',
                    },
                  },
                  registration.externalBeneficiary === ''
                    ? registration.internalBeneficiary
                      ? `${registration.internalBeneficiary.firstName} ${registration.internalBeneficiary.lastName}\n`
                      : registration.author
                        ? `${registration.author.firstName} ${registration.author.lastName}\n`
                        : registration.authorEmail
                    : `${registration.externalBeneficiary}\n`,
                  registration.author
                    ? `${registration.author.firstName} ${registration.author.lastName}\n`
                    : registration.authorEmail,
                  registration.ticket.event.title + '\n',
                  registration.ticket.name + '\n',
                  // TODO generate pdf via frontend, use .priceIsVariable, etc.
                  registration.ticket.minimumPrice + '€\n',
                  registration.paymentMethod
                    ? DISPLAY_PAYMENT_METHODS[
                        registration.paymentMethod as keyof typeof DISPLAY_PAYMENT_METHODS
                      ]
                    : 'Inconnue',
                  '\n',
                  registration.ticket.event.startsAt.toLocaleDateString('fr-FR') + '\n',
                  registration.ticket.event.location,
                ],
              },
            ],
            columnGap: 10,
          },
        ],
      },
    ],
    defaultStyle: {
      font: 'SpaceGrotesk',
    },
  };

  const printer = new pdfMakePrinter(fonts);

  // @ts-expect-error says canvas is required, but it works without it so /shrug
  const pdf = printer.createPdfKitDocument(dd);
  return pdf;
}

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
