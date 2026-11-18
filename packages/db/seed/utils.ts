/**
 * Fonctions utilisées pour le seed
 */
import { fakerFR } from '@faker-js/faker';
import { existsSync } from 'node:fs';
import path from 'node:path';
import slug from 'slug';
import type { Prisma } from '../src/client/index.js';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';


export const faker = fakerFR;
faker.seed(5);

/**
 * Renvoie un array d'objets contenant des liens aléatoires avec un nom et une valeur
 * @param count le nombre de liens à générer
 * @returns l'array d'objets contenant les liens aléatoires
 */
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

export function getRandomServices(count: number): Prisma.ServiceCreateInput[] {
  const services: Prisma.ServiceCreateInput[] = [];
  for (let i = 0; i < count; i++) {
    services.push({
      name: faker.company.name(),
      logo: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
      url: faker.internet.url(),
      logoSourceType: 'ExternalLink',
      description: faker.company.catchPhrase(),
    });
  }
  return services;
}

/**
 * Renvoie un objet LydiaAccountCreateInput si les variables d'environnement SEED_LYDIA_PUBLIC_TOKEN et SEED_LYDIA_PRIVATE_TOKEN sont définies, sinon renvoie undefined
 * @returns un objet LydiaAccountCreateInput avec les infos de l'account Lydia ou undefined
 */
export function getLydiaAccountData(): Prisma.LydiaAccountCreateInput | undefined {
  if(process.env['SEED_LYDIA_PUBLIC_TOKEN'] && process.env['SEED_LYDIA_PRIVATE_TOKEN']){
    return {
      name: faker.company.name(),
      vendorToken: process.env['SEED_LYDIA_PUBLIC_TOKEN'],
      privateToken: process.env['SEED_LYDIA_PRIVATE_TOKEN'],
    };
  }
  return undefined;
}

/**
 * Génère un titre aléatoire avec un nombre de mots compris entre min et max
 * La première lettre est en majuscule (utilise lorem.words de faker)
 * @param min nombre minimum de mots
 * @param max nombre maximum de mots
 * @returns un string représentant le titre aléatoire
 */
export function fakeTitle(min = 2, max = 5): string {
  const words = faker.lorem.words({ min, max });
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Génère un texte aléatoire au format Markdown
 * Utilise faker pour générer des phrases et des paragraphes aléatoires, ainsi que des titres, des listes et des citations aléatoires
 * @returns un string représentant le texte aléatoire au format Markdown
 */
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

async function downloadRandomImage(width: number, height: number): Promise<Buffer> {
  return fetchImage(faker.image.urlPicsumPhotos({ width, height }));
}

async function downloadRandomPeoplePhoto(size: 32 | 64 | 128 | 256 | 512 = 512): Promise<Buffer> {
  try {
    return await fetchImage(faker.image.personPortrait({ size }));
  } catch (error) {
    console.warn(`personPortrait failed (${error}), falling back to GitHub avatar`);
    return fetchImage(faker.image.avatarGitHub());
  }
}

/**
 * Downloads a random picture (via faker) and stores it in the storage folder.
 * No dependency on the API or on the database: the caller writes the returned path
 * in the appropriate column.
 * @returns the path relative to the storage root, or undefined on failure
 */
export async function storePicture({
  resource,
  folder,
  extension,
  identifier,
  width = 400,
  height = 400,
  kind = 'image',
}: {
  resource: 'article' | 'event' | 'user' | 'group' | 'school' | 'student-association' | 'photos';
  folder: string;
  extension: 'png' | 'jpg';
  identifier: string;
  width?: number;
  height?: number;
  kind?: 'image' | 'person';
}): Promise<string | undefined> {
  const root = storageRoot();
  const destination = path.join(root, folder, `${identifier}.${extension}`);
  const relativePath = path.relative(root, destination);
  if (existsSync(destination)) return relativePath;

  try {
    const buffer =
      kind === 'person'
        ? await downloadRandomPeoplePhoto(Math.max(width, height) <= 128 ? 128 : 512)
        : await downloadRandomImage(width, height);

    await mkdir(path.dirname(destination), { recursive: true });
    await compressPhoto(buffer, destination, extensionToFormat[extension], {
      square: resource === 'user' || resource === 'group',
    });

    return relativePath;
  } catch (error) {
    console.warn(
      `Could not download random image: ${error}. This is not critical, seeding will continue`,
    );
    return undefined;
  }
}

async function fetchImage(url: string): Promise<Buffer> {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) {
    throw new Error(`Expected an image from ${url}, got "${contentType}"`);
  }
  return Buffer.from(await response.arrayBuffer());
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

/**
 * Genère une valeur unique en ajoutant un suffixe numérique si nécessaire pour éviter les collisions avec les valeurs déjà utilisées
 * @param base la valeur de base
 * @param used l'ensemble des valeurs déjà utilisées
 * @param separator le séparateur à utiliser entre la valeur de base et le suffixe
 * @returns la valeur unique générée
 */
function uniqueValue(base: string, used: Set<string>, separator = ''): string {
  let candidate = base;
  for (let n = 2; used.has(candidate); n++) candidate = `${base}${separator}${n}`;
  used.add(candidate);
  return candidate;
}

/**
 * Crée une fonction qui génère des slugs uniques à partir d'un texte donné, en utilisant un séparateur spécifié
 * @param separator le séparateur à utiliser entre les mots du slug
 * @returns la fonction qui génère des slugs uniques
 */
export function createSlugger(separator = '-') {
  const used = new Set<string>();
  return (text: string) => uniqueValue(slug(text), used, separator);
}

/**
 * genère un identifiant unique à partir d'un prénom et d'un nom de famille, en utilisant un ensemble de valeurs déjà utilisées pour éviter les collisions
 * @param firstName le prénom
 * @param lastName le nom de famille
 * @param used l'ensemble des valeurs déjà utilisées
 * @returns l'identifiant unique généré
 */
export function uniqueUid(firstName: string, lastName: string, used: Set<string>): string {
  return uniqueValue(toAscii(lastName).slice(0, 16) + toAscii(firstName).charAt(0), used);
}

//Those functions and this const are heavily inspired by the API but put in this script to avoid a dependency on the API.

const extensionToFormat = { jpg: 'jpeg', png: 'png' } as const;

function storageRoot(): string {
  const root = process.env['SEED_STORAGE_ROOT'];
  if (!root) throw new Error('SEED_STORAGE_ROOT is not set');
  return root;
}

//Copié collé de l'api
async function compressPhoto(
  buf: Buffer,
  filename: string,
  format: 'png' | 'jpeg',
  { square = false }: { square?: boolean },
) {
  const operations = sharp(buf, { failOn: 'none' })
    .resize({
      width: 1000,
      ...(square ? { height: 1000, position: 'entropy' } : {}),
      withoutEnlargement: true,
    })
    // auto-rotate from EXIF data
    .rotate();

  await (format === 'png' ? operations.png({ quality: 80 }) : operations.jpeg({ quality: 80 })).toFile(
    filename,
  );
}


