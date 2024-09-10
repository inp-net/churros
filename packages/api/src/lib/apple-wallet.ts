import type { Prisma } from '@churros/db/prisma';
import { Template } from '@startse/pass-js';
import { addDays, format, subMinutes } from 'date-fns';
import { GraphQLError } from 'graphql';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path/posix';
import sharp from 'sharp';
import { localID } from './global-id.js';
import { storageRoot } from './storage.js';

let appleWalletTemplate: Template | null = null;

export async function writePemCertificate(to: string) {
  if (!process.env.APPLE_WALLET_PEM_CERTIFICATE) {
    console.warn(
      `No APPLE_WALLET_PEM_CERTIFICATE set in environment variables, not writing certificate to ${to}.`,
    );
    return;
  }
  await writeFile(to, process.env.APPLE_WALLET_PEM_CERTIFICATE);
}

export async function registerAppleWalletPassTemplate() {
  if (appleWalletTemplate) return;
  console.info('Registering Apple Wallet pass template...');
  const template = new Template('eventTicket', {
    passTypeIdentifier: process.env.APPLE_WALLET_PASS_TYPE_ID,
    teamIdentifier: process.env.APPLE_WALLET_TEAM_ID,
    backgroundColor: 'white',
    sharingProhibited: true,
    organizationName: 'net7', // TODO: dehardcode?
    logoText: 'Churros',
  });
  await template.images.add('logo', 'static/apple-wallet-assets/logo-color@128px.png');
  await template.images.add('logo', 'static/apple-wallet-assets/logo-color@256px.png', '2x');
  await template.images.add('icon', 'static/apple-wallet-assets/logo-black@128px.png');
  await template.images.add('icon', 'static/apple-wallet-assets/logo-black-thin@256px.png', '2x');
  await writePemCertificate('apple-wallet-cert.pem');
  if (!existsSync('apple-wallet-cert.pem')) {
    console.warn(
      'No apple-wallet-cert.pem found, not loading certificate. Apple Wallet integration is disabled.',
    );
    appleWalletTemplate = null;
    return;
  }
  await template.loadCertificate(
    'apple-wallet-cert.pem',
    process.env.APPLE_WALLET_PEM_KEY_PASSWORD,
  );
  appleWalletTemplate = template;
  return appleWalletTemplate;
}

export function canCreateAppleWalletPasses() {
  return appleWalletTemplate !== null;
}

export async function createAppleWalletPass(
  booking: Prisma.RegistrationGetPayload<{ include: typeof createAppleWalletPass.prismaIncludes }>,
) {
  if (!appleWalletTemplate) throw new Error('Apple Wallet template not loaded');
  if (!booking.ticket.event.endsAt || !booking.ticket.event.startsAt)
    throw new GraphQLError("Cet événement n'a pas de date de début ou de fin");

  const pass = appleWalletTemplate.createPass({
    serialNumber: localID(booking.id),
    description: `Place ${booking.ticket.name} pour ${booking.ticket.event.title}`,
    expirationDate: addDays(booking.ticket.event.endsAt, 3).toISOString(),
    relevantDate: subMinutes(booking.ticket.event.startsAt, 5).toISOString(),
    barcodes: [
      {
        message: new URL(`/bookings/${booking.id}`, process.env.PUBLIC_FRONTEND_ORIGIN).toString(),
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
        altText: localID(booking.id).toUpperCase(),
      },
    ],
    // TODO semantic tags, see https://developer.apple.com/documentation/walletpasses/semantictags and https://github.com/tinovyatkin/pass-js/issues/75
  });
  const storagePath = (filename: string) => path.join(storageRoot(), filename);
  if (booking.ticket.event.pictureFile) {
    const picfile1x = `passes/apple/${localID(booking.id)}-logo@1x.png`;
    const picfile2x = `passes/apple/${localID(booking.id)}-logo@2x.png`;

    if ([picfile1x, picfile2x].some((f) => !existsSync(storagePath(f)))) {
      console.info(
        `[apple wallet] Creating apple wallet images from ${booking.ticket.event.pictureFile}`,
      );
      await mkdir(storagePath('passes/apple'), { recursive: true });
      await sharp(storagePath(booking.ticket.event.pictureFile))
        .resize(80)
        .toFile(storagePath(picfile1x));
      await sharp(storagePath(booking.ticket.event.pictureFile))
        .resize(160)
        .toFile(storagePath(picfile2x));
    }

    pass.images.add('thumbnail', storagePath(picfile1x), '1x');
    pass.images.add('thumbnail', storagePath(picfile2x), '2x');
  }

  pass.backFields.add({
    key: 'code',
    label: 'Code de réservation',
    value: localID(booking.id).toUpperCase(),
    attributedValue: `<a href="${new URL(`/bookings/${localID(booking.id).toUpperCase()}`, process.env.PUBLIC_FRONTEND_ORIGIN)}">${localID(booking.id).toUpperCase()}</a>`,
  });
  pass.primaryFields.add({
    key: 'title',
    label: 'Évènement',
    value: booking.ticket.event.title,
  });
  pass.auxiliaryFields.add({
    key: 'date',
    label: 'Date',
    value: booking.ticket.event.startsAt,
    dateStyle: 'PKDateStyleShort',
  });

  const beneficiaryDisplay = booking.internalBeneficiary
    ? fullName(booking.internalBeneficiary)
    : booking.externalBeneficiary || (booking.author ? fullName(booking.author) : '(Inconnu)');

  const beneficiaryURL =
    booking.internalBeneficiary || booking.author
      ? new URL(
          `/${booking.internalBeneficiary?.uid ?? booking.author?.uid}`,
          process.env.PUBLIC_FRONTEND_ORIGIN,
        )
      : null;

  pass.secondaryFields.add({
    key: 'beneficiary',
    label: 'Pour',
    value: beneficiaryDisplay,
    attributedValue: `<a href=${beneficiaryURL}>${beneficiaryDisplay}</a>`,
  });
  pass.secondaryFields.add({
    key: 'start-at',
    label: 'Début',
    value: format(booking.ticket.event.startsAt, 'HH:mm'),
  });
  pass.secondaryFields.add({
    key: 'end-at',
    label: 'Fin',
    value: format(booking.ticket.event.endsAt, 'HH:mm'),
  });
  pass.auxiliaryFields.add({
    key: 'location',
    label: 'Lieu',
    value: booking.ticket.event.location,
  });
  pass.backFields.add({
    key: 'booked-at',
    label: 'Réservé le',
    value: booking.createdAt,
    dateStyle: 'PKDateStyleLong',
  });
  pass.backFields.add({
    key: 'organizers',
    label: 'Organisé par',
    value:
      booking.ticket.event.group.name +
      (booking.ticket.event.coOrganizers.length > 0
        ? ` avec ${booking.ticket.event.coOrganizers.map((c) => c.name).join(', ')}`
        : ''),
  });
  pass.backFields.add({
    key: 'contact',
    label: "Contact de l'organisation",
    value: booking.ticket.event.contactMail,
    attributedValue: `<a href="mailto:${booking.ticket.event.contactMail}">${booking.ticket.event.contactMail}</a>`,
  });
  pass.backFields.add({
    key: 'booked-time',
    label: 'Réservé à',
    value: format(booking.createdAt, 'HH:mm'),
  });
  pass.backFields.add({
    key: 'platform',
    label: 'Acheté sur',
    value: new URL(process.env.PUBLIC_FRONTEND_ORIGIN).hostname,
  });
  if (booking.ticket.name || booking.ticket.event._count.tickets > 1) {
    pass.headerFields.add({
      key: 'ticket-name',
      label: 'Billet',
      value: booking.ticket.name || 'Normal',
    });
  }

  return pass;
}

createAppleWalletPass.prismaIncludes = {
  internalBeneficiary: true,
  author: true,
  ticket: {
    include: {
      event: {
        include: {
          group: true,
          coOrganizers: true,
          _count: {
            select: {
              tickets: true,
            },
          },
        },
      },
    },
  },
} as const satisfies Prisma.RegistrationInclude;

export function fullName(user: { firstName: string; lastName: string; nickname?: string }) {
  const { firstName, lastName, nickname } = user;
  if (nickname) return `${firstName} ${lastName} (${nickname})`;
  return `${firstName} ${lastName}`;
}
