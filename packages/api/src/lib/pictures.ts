import { ensureGlobalId, log, prisma, storageRoot, type Context } from '#lib';
import { GraphQLError } from 'graphql';
import type { ImageFileExtension } from 'image-type';
import imageType from 'image-type';
import { mkdir, unlink } from 'node:fs/promises';
// eslint-disable-next-line unicorn/import-style
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
  root,
}: {
  folder: string;
  extension: 'png' | 'jpg';
  identifier: string;
  root: string;
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
  root,
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
  if (!root) {
    // Doing this here because @churros/db cannot import from storage.js but needs the updatePicture function to run the seeding script, so we explicitly pass the storage root as an argument when calling updatePicture from the seeding script
    const { storageRoot } = await import('./storage.js');
    root = storageRoot();
  }
  const buffer = await file.arrayBuffer().then((array) => Buffer.from(array));
  const type = await imageType(buffer);
  if (!type || !supportedExtensions.includes(type.ext))
    throw new GraphQLError(`File format ${type?.ext ?? '(unknown)'} not supported`);

  // Delete the existing picture
  let pictureFile = '';
  switch (resource) {
    case 'article': {
      const result = await prisma.article.findUniqueOrThrow({
        where: { id: ensureGlobalId(identifier, 'Article') },
        select: { [propertyName]: true },
      });
      pictureFile = result[propertyName] as unknown as string;
      break;
    }

    case 'event': {
      const result = await prisma.event.findUniqueOrThrow({
        where: { id: ensureGlobalId(identifier, 'Event') },
        select: { [propertyName]: true },
      });
      pictureFile = result[propertyName] as unknown as string;
      break;
    }

    case 'user': {
      // TODO only take id, not uid. This function is low-level enough that the uid convenience is useless
      const result = await prisma.user.findFirstOrThrow({
        where: { OR: [{ uid: identifier }, { id: ensureGlobalId(identifier, 'User') }] },
        select: { [propertyName]: true },
      });
      pictureFile = result[propertyName] as unknown as string;
      break;
    }

    case 'group': {
      // TODO only take id, not uid. This function is low-level enough that the uid convenience is useless
      const result = await prisma.group.findFirstOrThrow({
        where: { OR: [{ uid: identifier }, { id: ensureGlobalId(identifier, 'Group') }] },
        select: { [propertyName]: true },
      });
      pictureFile = result[propertyName] as unknown as string;
      break;
    }

    case 'student-association': {
      const result = await prisma.studentAssociation.findFirstOrThrow({
        where: { OR: [{ uid: identifier }, { id: ensureGlobalId(identifier, 'User') }] },
        select: { [propertyName]: true },
      });
      pictureFile = result[propertyName] as unknown as string;
      break;
    }

    case 'school': {
      const result = await prisma.school.findUniqueOrThrow({
        where: { id: ensureGlobalId(identifier, 'School') },
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
    await unlink(join(root, pictureFile)).catch((error) =>
      console.error(
        `Could not delete ${pictureFile}: ${error} (this is considered OK, continuing to update picture)`,
      ),
    );
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
        where: { id: ensureGlobalId(identifier, 'Article') },
        data: { [propertyName]: relative(root, path) },
      });
      break;
    }

    case 'event': {
      await prisma.event.update({
        where: { id: ensureGlobalId(identifier, 'Event') },
        data: { [propertyName]: relative(root, path) },
      });
      break;
    }

    case 'group': {
      // TODO don't accept uid, only id (see above)
      await prisma.group.updateMany({
        where: { OR: [{ uid: identifier }, { id: ensureGlobalId(identifier, 'Group') }] },
        data: { [propertyName]: relative(root, path) },
      });
      break;
    }

    case 'user': {
      // TODO don't accept uid, only id (see above)
      await prisma.user.updateMany({
        where: { OR: [{ uid: identifier }, { id: ensureGlobalId(identifier, 'User') }] },
        data: { [propertyName]: relative(root, path) },
      });
      break;
    }

    case 'student-association': {
      // TODO don't accept uid, only id (see above)
      await prisma.studentAssociation.updateMany({
        where: {
          OR: [{ uid: identifier }, { id: ensureGlobalId(identifier, 'StudentAssociation') }],
        },
        data: { [propertyName]: relative(root, path) },
      });
      break;
    }

    case 'school': {
      await prisma.school.update({
        where: { id: ensureGlobalId(identifier, 'School') },
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

export async function removePicture({
  user,
  resourceId,
  resourceType,
}: {
  user: Context['user'];
  /** The *global* ID */
  resourceId: string;
  /** Has to be a valid prisma table (we should be able to call prisma[resourceType].update) */
  resourceType: 'user' | 'group' | 'event' | 'article' | 'school' | 'studentAssociation';
}): Promise<{ alreadyDeleted: boolean; pictureFile: string }> {
  await log('pictures', 'delete-picture', {}, resourceId, user);
  // @ts-expect-error prisma won't infer type (i mean this is kinda to be expected but whatever)
  const { pictureFile } = await prisma[resourceType].findUniqueOrThrow({
    where: { id: resourceId },
    select: { pictureFile: true },
  });
  if (pictureFile) {
    const root = storageRoot();
    await unlink(join(root, pictureFile)).catch((error) =>
      console.error(
        `Could not delete ${pictureFile}: ${error} (this is considered OK, continuing to update picture)`,
      ),
    );
    // @ts-expect-error prisma won't infer type (i mean this is kinda to be expected but whatever)
    await prisma[resourceType].update({
      where: { id: resourceId },
      data: { pictureFile: '' },
    });
    return { alreadyDeleted: false, pictureFile };
  }

  return { alreadyDeleted: true, pictureFile: '' };
}
