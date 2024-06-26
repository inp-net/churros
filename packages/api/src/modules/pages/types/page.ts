import { builder, toHtml } from '#lib';
import path from 'node:path/posix';

export const PageType = builder.prismaObject('Page', {
  description:
    "Une page écrite par un·e utilisateur·rice, servant par exemple à présenter les partenariats d'une AE sur une page dédiée.",
  include: {
    group: true,
    studentAssociation: true,
  },
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    path: t.exposeString('path', {
      description:
        "Chemin vers la page. Doit être unique _par AE ou groupe_. L'URL finale sera donc préfixée d'une certaine manière pour éviter les collisions.",
    }),
    title: t.exposeString('title', {
      description: 'Titre de la page.',
    }),
    body: t.exposeString('body', {
      description: 'Contenu de la page. Supporte la syntaxe Markdown.',
    }),
    bodyHtml: t.string({
      description: 'Contenu de la page, converti en HTML. Protégé contre les attaques XSS.',
      resolve: async ({ body }) => toHtml(body),
    }),
    lastAuthor: t.relation('lastAuthor', {
      description:
        "Dernier·ère utilisateur·rice ayant modifié la page. Peut être null si la page n'a jamais été modifiée, ou que l'utilisateur·ice en question a été supprimé·e.",
      nullable: true,
    }),
    studentAssociation: t.relation('studentAssociation', {
      description:
        "Association étudiante à laquelle appartient la page. Peut être null si la page n'appartient à aucune association.",
      nullable: true,
    }),
    group: t.relation('group', {
      description:
        "Groupe auquel appartient la page. Peut être null si la page n'appartient à aucun groupe.",
      nullable: true,
    }),
    files: t.exposeStringList('files', {
      description:
        'Chemin vers les fichiers inclus sur la page, par exmple des images. Voir filesURLs pour obtenir les URLs de ces fichiers.',
    }),
    filesURLs: t.stringList({
      description: 'URLs vers les fichiers inclus sur la page.',
      resolve: async ({ files }) =>
        files.map((file) => {
          const result = new URL(process.env.PUBLIC_STORAGE_URL);
          result.pathname = path.join(result.pathname, file);
          return result.toString();
        }),
    }),
  }),
});
