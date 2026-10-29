/**
 * Fonctions utilisées pour le seed
 */
import { fakerFR } from '@faker-js/faker';
import { format } from 'date-fns';
import dichotomid from 'dichotomid';
import { existsSync } from 'node:fs';
import path from 'node:path';
import slug from 'slug';
import { pictureDestinationFile, updatePicture } from '../../api/src/lib/pictures.js';
import { storageRoot } from '../../api/src/lib/storage.js';
import { Visibility, type PrismaClient, type QuestionKind } from '../src/client/default.js';

export const faker = fakerFR;
faker.seed(5);

export const storageRootDirectory = storageRoot();

export const skipImages = Boolean(process.env['SEED_SKIP_IMAGES']);

export const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;

export function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * DAY);
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size));
  return chunks;
}

/** Deterministic pseudo-random color from a string (used for group colors) */
export function color(str: string): string {
  let hash = 0xc0_ff_ee;
  /* eslint-disable */
  for (const char of str) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  const red = ((hash & 0xff0000) >> 16) + 1;
  const green = ((hash & 0x00ff00) >> 8) + 1;
  const blue = (hash & 0x0000ff) + 1;
  /* eslint-enable */
  const l = 0.4 * red + 0.4 * green + 0.2 * blue;
  const h = (n: number) =>
    Math.min(0xd0, Math.max(0x60, Math.floor((n * 0xd0) / l)))
      .toString(16)
      .padStart(2, '0');
  return `#${h(red)}${h(green)}${h(blue)}`;
}

export function randomVisibility(): Visibility {
  return faker.helpers.weightedArrayElement([
    { weight: 40, value: Visibility.Public },
    { weight: 15, value: Visibility.SchoolRestricted },
    { weight: 25, value: Visibility.GroupRestricted },
    { weight: 5, value: Visibility.Unlisted },
    { weight: 15, value: Visibility.Private },
  ]);
}

export function fakeTitle(min = 2, max = 5): string {
  const words = faker.lorem.words({ min, max });
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function fakeMarkdown(): string {
  const parts = [`**${faker.lorem.sentence()}** ${faker.lorem.paragraph()}`];
  for (let i = 0; i < faker.number.int({ min: 1, max: 3 }); i++) {
    parts.push(`# ${fakeTitle(2, 4)}`, faker.lorem.paragraph());
    if (faker.datatype.boolean(0.5)) {
      parts.push(
        faker.helpers
          .multiple(() => `- ${faker.lorem.sentence()}`, { count: 3 })
          .join('\n'),
      );
    }
    if (faker.datatype.boolean(0.3)) parts.push(`> ${faker.lorem.sentence()}`);
  }
  if (faker.datatype.boolean(0.4)) parts.push(`[${faker.lorem.words(2)}](https://example.com)`);
  return parts.join('\n\n');
}

export function fakeAnswer(question: {
  type: QuestionKind;
  options: string[];
  scaleStart: number | null;
  scaleEnd: number | null;
}): string[] {
  switch (question.type) {
    case 'Scale': {
      const span = (question.scaleEnd ?? 0) - (question.scaleStart ?? 0);
      return [`${faker.number.int({ min: 0, max: span })}/${span}`];
    }
    case 'SelectOne': {
      return [faker.helpers.arrayElement(question.options)];
    }
    case 'SelectMultiple': {
      return faker.helpers.arrayElements(question.options, { min: 1, max: 3 });
    }
    case 'Text': {
      return [faker.lorem.sentence()];
    }
    case 'LongText': {
      return [faker.lorem.paragraph()];
    }
    case 'Number': {
      return [faker.number.float({ min: -5, max: 20, fractionDigits: 2 }).toString()];
    }
    case 'Date': {
      return [format(faker.date.past(), 'yyyy-MM-dd')];
    }
    case 'Time': {
      return [format(faker.date.past(), 'HH:mm:ss')];
    }
    default: {
      return [];
    }
  }
}

export function randomImageURL(width: number, height: number, seed: string): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

export async function downloadRandomImage(
  width: number,
  height: number,
  seed: string,
): Promise<File> {
  const response = await fetch(randomImageURL(width, height, seed));
  const blob = await response.blob();
  return new File([blob], path.basename(new URL(response.url).pathname), { type: 'image/jpeg' });
}

export async function downloadRandomPeoplePhoto(): Promise<File> {
  const response = await fetch('https://thispersondoesnotexist.com');
  return new File([await response.blob()], 'profile.jpeg', { type: 'image/jpeg' });
}

type UpdatePictureOptions = Parameters<typeof updatePicture>[0];

export async function storePicture(
  options: Omit<UpdatePictureOptions, 'file' | 'silent' | 'root'> & {
    width?: number;
    height?: number;
    kind?: 'image' | 'person';
  },
): Promise<string | undefined> {
  const { width = 400, height = 400, kind = 'image', ...pictureOptions } = options;

  const destination = pictureDestinationFile({
    folder: pictureOptions.folder,
    extension: pictureOptions.extension,
    identifier: pictureOptions.identifier,
    root: storageRootDirectory,
  });
  if (existsSync(destination)) return path.relative(storageRootDirectory, destination);
  if (skipImages) return undefined;

  try {
    const file =
      kind === 'person'
        ? await downloadRandomPeoplePhoto()
        : await downloadRandomImage(width, height, pictureOptions.identifier);
    return await updatePicture({
      ...pictureOptions,
      file,
      silent: true,
      root: storageRootDirectory,
    });
  } catch (error) {
    console.warn(
      `Could not download random image: ${error}. This is not critical, seeding will continue`,
    );
    return undefined;
  }
}

const toAscii = (x: string) =>
  slug(x.toLocaleLowerCase(), {
    charmap: {
      é: 'e',
      è: 'e',
      ê: 'e',
      ë: 'e',
      à: 'a',
      â: 'a',
      ä: 'a',
      ô: 'o',
      ö: 'o',
      û: 'u',
      ü: 'u',
      ï: 'i',
      ç: 'c',
    },
  }).replaceAll('-', '');

export async function createUid(
  prisma: PrismaClient,
  { firstName, lastName, uid }: { firstName: string; lastName: string; uid?: string },
): Promise<string> {
  if (uid) return uid;
  const base = toAscii(lastName).slice(0, 16) + toAscii(firstName).charAt(0);
  const n = await dichotomid(async (n) => {
    const candidate = `${base}${n > 1 ? n : ''}`;
    return !(await prisma.user.findFirst({ where: { uid: candidate } }));
  });
  return `${base}${n > 1 ? n : ''}`;
}