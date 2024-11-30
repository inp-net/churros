import { builder, ENV, log, storageRoot, UnauthorizedError } from '#lib';
import { CheckBackLaterError, URLScalar } from '#modules/global';
import { createGdprExport, gdprExportCreationDateFromFilename } from '#modules/users';
import { findExistingGdprExport, GDPR_EXPORT_EXPIRATION_HOURS } from '#modules/users/utils';
import { differenceInHours, hoursToSeconds } from 'date-fns';
import path from 'node:path';
import { ZodError } from 'zod';

builder.mutationField('createGdprExport', (t) =>
  t.field({
    type: URLScalar,
    description:
      "Créer une demande d'export RGPD de données personnelles pour la peronne connectée. Renvoie le lien a télécharger quand un export est prêt. Voir aussi User.gdprExport pour récupérer un lien sans émettre une nouvelle demande.",
    errors: {
      types: [Error, ZodError, CheckBackLaterError],
    },
    directives: {
      rateLimit: {
        duration: hoursToSeconds(1),
        limit: 10,
      },
    },
    authScopes: { loggedIn: true },
    args: {
      force: t.arg.boolean({
        defaultValue: false,
        description: `Forcer la création d'une nouvelle demande d'export de données personnelles RGPD. Par défaut, une nouvelle demande est créée si l'export date de plus de ${GDPR_EXPORT_EXPIRATION_HOURS} heures.`,
      }),
    },
    async resolve(_, { force }, { user }) {
      if (!user) throw new UnauthorizedError();

      const existingExport = await findExistingGdprExport(user);

      if (existingExport) {
        const exportDate = gdprExportCreationDateFromFilename(path.basename(existingExport));

        if (!force && differenceInHours(new Date(), exportDate) < GDPR_EXPORT_EXPIRATION_HOURS) {
          await log(
            'users',
            'gdpr-export/download',
            {
              user: user.uid,
              export: existingExport,
              dateOfExport: exportDate,
            },
            user.id,
            user,
          );
          return new URL(
            `${ENV.PUBLIC_STORAGE_URL}/${path.relative(storageRoot(), existingExport)}`,
          );
        }
      }

      await log('users', 'gdpr-export/create', { user: user.uid, force }, user.id, user);
      void createGdprExport(user);
      throw new CheckBackLaterError('export de données personnelles');
    },
  }),
);
