import {
  ENV,
  UnauthorizedError,
  fullName,
  log,
  prisma,
  sendMail,
  storageRoot,
  type Context,
} from '#lib';
import type { Prisma } from '@churros/db/prisma';
import { parseISO } from 'date-fns';
import { globSync } from 'glob';
import omit from 'lodash.omit';
import { nanoid } from 'nanoid';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/** Relative to the storage root. */
export const GDPR_EXPORTS_STORAGE_DIRECTORY = 'gdpr-exports';

/** In hours */
export const GDPR_EXPORT_EXPIRATION_HOURS = 24;

export const GDPR_EXPORT_INCLUDES = {
  bookmarks: true,
  godchildren: true,
  godparent: true,
  incomingGodparentRequests: true,
  outgoingGodparentRequests: true,
  contributions: {
    include: { option: true },
  },
  managedEvents: {
    include: { event: true },
  },
  Reservation: {
    include: { ticket: true },
  },
  seenBookings: {
    include: { ticket: true },
  },
  receivedBookings: {
    include: { ticket: true },
  },
  notificationSubscriptions: true,
  notifications: true,
  documents: true,
  reactions: true,
  claimedPromotions: true,
  formAnswers: true,
  partiallyCompletedForms: true,
} satisfies Prisma.UserInclude;

export async function createGdprExport(user: Context['user']) {
  if (!user) throw new UnauthorizedError();
  const data = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    include: GDPR_EXPORT_INCLUDES,
  });

  const exportedAt = new Date();
  const exportFilepath = gdprExportFilepath(user, exportedAt);

  await writeFile(
    exportFilepath,
    JSON.stringify(
      {
        _: `Ceci est un export de données personnelles conformément au RGPD pour ${fullName(omit(user, 'nickname'))} (@${user.uid}).`,
        __: `Il est, conformément à la loi, exploitable par du code informatique, puisqu'il est au format JSON (https://www.json.org/json-fr.html)`,
        instance: ENV.PUBLIC_FRONTEND_ORIGIN,
        exportedAt,
        data,
      },
      null,
      2,
    ),
  );

  await log(
    'users',
    'gdpr-export/ready',
    { user: user.uid, export: exportFilepath },
    user.id,
    user,
  );

  await sendMail(
    'gdpr-export-ready',
    user.email,
    {
      fullName: fullName(user),
      downloadLink: `${ENV.PUBLIC_STORAGE_URL}/${path.relative(storageRoot(), exportFilepath)}`,
    },
    {},
  );
}

/**
 * Returns the absolute filepath to the GDPR export
 * @param user the user to export data for
 * @param createdAt the date of the export
 */
export function gdprExportFilepath(user: Context['user'], createdAt: Date) {
  if (!user) throw new UnauthorizedError();
  const filename = `${user.uid}_${createdAt.toISOString().replaceAll(/[.:_]/g, '-')}_${nanoid(30)}.json`;
  return path.join(storageRoot(), GDPR_EXPORTS_STORAGE_DIRECTORY, filename);
}

export function gdprExportCreationDateFromFilename(filename: string) {
  const createdAtString = filename.split('_')[2]?.split('.')[0];
  if (!createdAtString) throw new Error('Invalid filename');
  return parseISO(createdAtString);
}

/**
 * Find the most recent GDPR export for a user
 * @param user the user to find the export for
 * @returns the absolute filepath to the export, or undefined if none exists
 */
export async function findExistingGdprExport(user: Context['user']) {
  if (!user) throw new UnauthorizedError();

  const directory = path.join(storageRoot(), GDPR_EXPORTS_STORAGE_DIRECTORY);
  await mkdir(directory, { recursive: true });

  const pattern = path.join(directory, `${user.uid}_*.json`);
  return globSync(pattern, { absolute: true }).sort().at(-1);
}
