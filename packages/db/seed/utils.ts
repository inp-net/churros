/**
 * Fonctions utilisées pour le seed
 */
import { fakerFR } from '@faker-js/faker';
import { existsSync } from 'node:fs';
import path from 'node:path';
import slug from 'slug';
import type { Prisma } from '../src/client/index.js';

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
      logo: faker.image.urlLoremFlickr({ category: 'business', width: 400, height: 400 }),
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

/**
 * Recupère une image aléatoire depuis picsum.photos avec une taille et un seed donnés
 * @param width la largeur de l'image
 * @param height la hauteur de l'image
 * @param seed le seed pour générer l'image
 * @returns l'URL de l'image aléatoire
 */
function randomImageURL(width: number, height: number, seed: string): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/**
 * Recupère une image aléatoire depuis picsum.photos avec une taille et un seed donnés et la télécharge en tant que File
 * @param width la largeur de l'image
 * @param height la hauteur de l'image
 * @param seed le seed pour générer l'image
 * @returns un objet File représentant l'image téléchargée
 */
export async function downloadRandomImage(
  width: number,
  height: number,
  seed: string,
): Promise<File> {
  const response = await fetch(randomImageURL(width, height, seed));
  const blob = await response.blob();
  return new File([blob], path.basename(new URL(response.url).pathname), { type: 'image/jpeg' });
}

let portraitUrls: string[] | undefined;

async function getPortraitUrls(): Promise<string[]> {
  if (portraitUrls) return portraitUrls;
  const response = await fetch('https://randomuser.me/api/?results=500&inc=picture&noinfo&seed='+faker.string.uuid());
  if (!response.ok) throw new Error(`randomuser API: HTTP ${response.status}`);
  const json = (await response.json()) as { results?: { picture: { large: string } }[] };
  if (!json.results?.length) throw new Error(`randomuser API: unexpected payload ${JSON.stringify(json).slice(0, 200)}`);
  portraitUrls = json.results.map((r) => r.picture.large);
  return portraitUrls;
}

async function fetchImage(url: string, filename: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) {
    throw new Error(`Expected an image from ${url}, got "${contentType}"`);
  }
  return new File([await response.blob()], filename, { type: contentType });
}

async function downloadRandomPeoplePhoto(): Promise<File> {
  const urls = await getPortraitUrls();
  return fetchImage(faker.helpers.arrayElement(urls), 'profile.jpg');
}

//Copié collé pas très clean de l'api, mais on veut pas importer l'api dans le seed pour le job de seeding
type UpdatePictureOptions = {
  resource: 'article' | 'event' | 'user' | 'group' | 'school' | 'student-association' | 'photos';
  folder: string;
  extension: 'png' | 'jpg';
  file: File;
  identifier: string;
  propertyName?: string;
  silent?: boolean;
  root?: string;
};

export async function storePicture(
  options: Omit<UpdatePictureOptions, 'file' | 'silent' | 'root'> & {
    width?: number;
    height?: number;
    kind?: 'image' | 'person';
  },
): Promise<string | undefined> {
  const { width = 400, height = 400, kind = 'image', ...pictureOptions } = options;
  const { pictureDestinationFile, updatePicture } = await import('../../api/src/lib/pictures.js');
  const { storageRoot } = await import('../../api/src/lib/storage.js');
  const storageRootDirectory = storageRoot();
  
  const destination = pictureDestinationFile({
    folder: pictureOptions.folder,
    extension: pictureOptions.extension,
    identifier: pictureOptions.identifier,
    root: storageRootDirectory,
  });
  if (existsSync(destination)) return path.relative(storageRootDirectory, destination);

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