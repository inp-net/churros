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

export function getRandomLinks(count: number): { name: string; value: string }[] {
  const links: { name: string; value: string }[] = [];
  for (let i = 0; i < count; i++) {
    links.push({
      name: faker.music.genre(),
      value: faker.internet.url(),
    });
  }
  return links;
}

export function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * DAY);
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size));
  return chunks;
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