import { prisma } from '#lib';
import { GraphQLError } from 'graphql';
import type { ImageFileExtension } from 'image-type';
import imageType from 'image-type';
import { mkdir, unlink } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import sharp from 'sharp';

export const supportedExtensions = [
  'png',
  'jpg',
  'webp',
  'gif',
  'svg',
  'avif',
  'tif',
] as ImageFileExtension[];

const extensionToFormat = {
  jpg: 'jpeg',
  png: 'png',
} as const;

export async function compressPhoto(
  buf: Buffer,
  filename: string,
  format: 'png' | 'jpeg',
  { square = false }: { square?: boolean },
) {
  let operations = sharp(buf, {
    failOn: 'none',
  })
    .resize({
      width: 1000,
      ...(square ? { height: 1000, position: 'entropy' } : {}),
      withoutEnlargement: true,
    })
    // auto-rotate from EXIF data
    .rotate();

  switch (format) {
    case 'png': {
      operations = operations.png({ quality: 80 });
      break;
    }

    case 'jpeg': {
      operations = operations.jpeg({ quality: 80 });
      break;
    }

    default: {
      break;
    }
  }

  await operations.toFile(filename);
}

/**
 * Computes the path to a given picture (where it would be stored using `updatePicture`)
 * @param folder Where to store the picture, relative to the storage root
 * @param extension The extension of the picture
 * @param identifier The identifier of the resource (most often the UID or the ID of the resource)
 * @returns The path to the picture, relative to the storage root
 */
export function pictureDestinationFile({
  folder,
  extension,
  identifier,
  root = new URL(process.env.STORAGE).pathname,
}: {
  folder: string;
  extension: 'png' | 'jpg';
  identifier: string;
  root?: string;
}) {
  return join(root, folder, `${identifier}.${extension}`);
}

/**
 * Stores (or replaces) a picture associated with a resource
 * @param resource The resource to update the picture for
 * @param folder Where to store the picture, relative to the storage root
 * @param extension The extension of the picture
 * @param file The file to upload
 * @param identifier The identifier of the resource (most often the UID or the ID of the resource)
 * @param propertyName The column name in the resource's database table that stores the path to the picture
 * @returns The path to the picture, relative to the storage root
 */
export async function updatePicture({
  resource,
  folder,
  extension,
  file,
  identifier,
  propertyName = 'pictureFile',
  silent = false,
  root = new URL(process.env.STORAGE).pathname,
}: {
  resource: 'article' | 'event' | 'user' | 'group' | 'school' | 'student-association' | 'photos';
  folder: string;
  extension: 'png' | 'jpg';
  file: File;
  identifier: string;
  propertyName?: string;
  silent?: boolean;
  root?: string;
}): Promise<string> {
  const buffer = await file.arrayBuffer().then((array) => Buffer.from(array));
  const type = await imageType(buffer);
  if (!type || !supportedExtensions.includes(type.ext))
    throw new GraphQLError(`File format ${type?.ext ?? '(unknown)'} not supported`);

  // Delete the existing picture
  let pictureFile = '';
  switch (resource) {
    case 'article': {
      const result = await prisma.article.findUniqueOrThrow({
        where: { id: identifier },
        select: { [propertyName]: true },
      });
      pictureFile = result[propertyName] as unknown as string;
      break;
    }

    case 'event': {
      const result = await prisma.event.findUniqueOrThrow({
        where: { id: identifier },
        select: { [propertyName]: true },
      });
      pictureFile = result[propertyName] as unknown as string;
      break;
    }

    case 'user': {
      const result = await prisma.user.findUniqueOrThrow({
        where: { uid: identifier },
        select: { [propertyName]: true },
      });
      pictureFile = result[propertyName] as unknown as string;
      break;
    }

    case 'group': {
      const result = await prisma.group.findUniqueOrThrow({
        where: { uid: identifier },
        select: { [propertyName]: true },
      });
      pictureFile = result[propertyName] as unknown as string;
      break;
    }

    case 'student-association': {
      const result = await prisma.studentAssociation.findUniqueOrThrow({
        where: { uid: identifier },
        select: { [propertyName]: true },
      });
      pictureFile = result[propertyName] as unknown as string;
      break;
    }

    case 'school': {
      const result = await prisma.school.findUniqueOrThrow({
        where: { id: identifier },
        select: { [propertyName]: true },
      });
      pictureFile = result[propertyName] as unknown as string;
      break;
    }

    default: {
      break;
    }
  }

  if (pictureFile && resource !== 'photos') {
    try {
      await unlink(join(root, pictureFile));
    } catch {}
  }

  const path = pictureDestinationFile({ folder, extension, identifier, root });
  await mkdir(dirname(path), { recursive: true });
  if (!silent) console.info(`Compressing picture to ${path}`);
  await compressPhoto(buffer, path, extensionToFormat[extension], {
    square: ['user', 'group'].includes(resource),
  });
  switch (resource) {
    case 'article': {
      await prisma.article.update({
        where: { id: identifier },
        data: { [propertyName]: relative(root, path) },
      });
      break;
    }

    case 'event': {
      await prisma.event.update({
        where: { id: identifier },
        data: { [propertyName]: relative(root, path) },
      });
      break;
    }

    case 'group': {
      await prisma.group.update({
        where: { uid: identifier },
        data: { [propertyName]: relative(root, path) },
      });
      break;
    }

    case 'user': {
      await prisma.user.update({
        where: { uid: identifier },
        data: { [propertyName]: relative(root, path) },
      });
      break;
    }

    case 'photos': {
      await prisma.picture.update({
        where: { id: identifier },
        data: { path: relative(root, path) },
      });
      break;
    }

    case 'school': {
      await prisma.school.update({
        where: { id: identifier },
        data: { [propertyName]: relative(root, path) },
      });
      break;
    }

    default: {
      break;
    }
  }

  return relative(root, path);
}
