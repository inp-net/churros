import { builder } from '#lib';
import { CredentialType } from '#modules/users';
import type { Credential } from '@churros/db/prisma';

type SignupCompletionResult = {
  needsManualValidation: boolean;
  token?: Credential;
};

export const SignupCompletionResultType = builder
  .objectRef<SignupCompletionResult>('SignupCompletionResult')
  .implement({
    description: "Résultat d'une finalisation d'inscription",
    fields: (t) => ({
      needsManualValidation: t.exposeBoolean('needsManualValidation', {
        description:
          "L'inscription n'est pas encore terminée, l'équipe administrative de l'AE doit valider la demade d'inscription",
      }),
      token: t.expose('token', {
        type: CredentialType,
        nullable: true,
        grantScopes: ['me', 'login'],
        description:
          "Token utilisable pour connecter la personne immédiatement suite à l'inscription",
      }),
    }),
  });
