import { builder } from '#lib';
import path from 'node:path/posix';

interface Pictured {
  pictureFile: string;
  pictureFileDark?: string | null;
}

export const PicturedInterface = builder.interfaceRef<Pictured>('Pictured').implement({
  description: 'Une ressource qui possède une image associée',
  fields: (t) => ({
    pictureFile: t.exposeString('pictureFile', { description: "Le nom du fichier de l'image" }),
    pictureFileDark: t.string({
      description: "Le nom du fichier de l'image, en thème sombre",
      resolve: ({ pictureFileDark }) => pictureFileDark ?? '',
    }),
    pictureURL: t.string({
      description: "L'URL publique de l'image",
      args: {
        dark: t.arg.boolean({
          defaultValue: false,
          description: "Utiliser l'image en thème sombre",
        }),
      },
      resolve: ({ pictureFile, pictureFileDark }, { dark }) => {
        const result = new URL(process.env.PUBLIC_STORAGE_URL);
        result.pathname = path.join(
          result.pathname,
          dark ? pictureFileDark || pictureFile : pictureFile,
        );
        return result.toString();
      },
    }),
  }),
});
