import type { ImageFileExtension } from 'image-type';
import sharp from 'sharp';

export const supportedExtensions = ['png', 'jpg', 'webp'] as ImageFileExtension[];

export async function compressPhoto(buf: Buffer, filename: string) {
  await sharp(buf, {
    failOn: 'none',
  })
    .resize({
      width: 1000,
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 80,
    })
    .toFile(filename);
}
