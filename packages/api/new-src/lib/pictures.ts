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

export async function updatePicture({
  resource,
  folder,
  extension,
  file,
  identifier,
  propertyName = 'pictureFile',
}: {
  resource: 'article' | 'event' | 'user' | 'group';
  folder: string;
  extension: 'png' | 'jpg';
  file: File;
  identifier: string;
  propertyName?: string;
}): Promise<string> {
  const buffer = await file.arrayBuffer().then((array) => Buffer.from(array));
  const type = await imageType(buffer);
  if (!type || !supportedExtensions.includes(type.ext))
    throw new GraphQLError('File format not supported');

  const root = new URL(process.env.STORAGE).pathname;

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

    default: {
      break;
    }
  }

  if (pictureFile) {
    try {
      await unlink(join(root, pictureFile));
    } catch {}
  }

  const path = join(root, folder, `${identifier}.${extension}`);
  await mkdir(dirname(path), { recursive: true });
  console.info(`Compressing picture to ${path}`);
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

    default: {
      break;
    }
  }

  return relative(root, path);
}
