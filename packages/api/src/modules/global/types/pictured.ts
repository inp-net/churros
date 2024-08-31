import { builder, decodeGlobalID } from '#lib';
import path from 'node:path/posix';

interface Pictured {
  id: string;
  pictureFile: string;
  pictureFileDark?: string | null;
  updatedAt?: Date | null;
}

export const PicturedInterface = builder.interfaceRef<Pictured>('Pictured').implement({
  description: 'Une ressource qui possède une image associée',
  resolveType({ id }) {
    return decodeGlobalID(id).typename;
  },
  fields: (t) => ({
    id: t.exposeID('id', { description: "L'identifiant global de la ressource" }),
    pictureFile: t.exposeString('pictureFile', { description: "Le nom du fichier de l'image" }),
    pictureFileDark: t.string({
      description: "Le nom du fichier de l'image, en thème sombre",
      resolve: ({ pictureFileDark }) => pictureFileDark ?? '',
    }),
    hasSeparateDarkPicture: t.boolean({
      description:
        "Si la ressource supported d'avoir une image en thème sombre différente de celle en thème clair",
      resolve: (_, __, ___, { parentType }) => {
        return parentType.name === 'Group';
      },
    }),
    pictureAltText: t.string({
      description: "Texte alternatif de l'image",
      resolve: (_, __, ___, { parentType }) => {
        switch (parentType.name) {
          case 'Group': {
            return 'Logo du groupe';
          }
          case 'Event': {
            return "Image de fond de l'évènement";
          }
          default: {
            return '';
          }
        }
      },
    }),
    pictureURL: t.string({
      description: "L'URL publique de l'image",
      args: {
        dark: t.arg.boolean({
          defaultValue: false,
          description: "Utiliser l'image en thème sombre",
        }),
        timestamp: t.arg.boolean({
          defaultValue: true,
          description:
            "Ajouter un timestamp à la fin de l'URL pour forcer le navigateur à recharger l'image. Le timestamp correspond à la date de dernière mise à jour de la ressource (si disponible), ou à l'heure actuelle.",
        }),
      },
      resolve: ({ pictureFile, pictureFileDark, updatedAt }, { dark, timestamp }) => {
        const filepath = dark ? pictureFileDark || pictureFile : pictureFile;
        if (!filepath) return '';

        const result = new URL(process.env.PUBLIC_STORAGE_URL);
        result.pathname = path.join(result.pathname, filepath);
        if (timestamp)
          result.searchParams.set('t', (updatedAt?.getTime() ?? Date.now()).toString());

        return result.toString();
      },
    }),
  }),
});
