import { builder, ENV } from '#lib';
import { AuthProvider } from '@churros/db/prisma';

export class InvalidAuthProviderError extends Error {
  constructor(allowedProviders: AuthProvider[]) {
    super(
      `Méthode de connexion invalide pour ton compte. Tu peux te connecter via ${allowedProviders
        .map((provider) => {
          switch (provider) {
            case AuthProvider.Local:
            case AuthProvider.LDAP:
              return 'ton mot de passe';
            case AuthProvider.OAuth:
              return ENV.PUBLIC_OAUTH_NAME || "l'authentification tierce";
          }
        })
        .join(', ')} `,
    );
  }
}

export const InvalidAuthProviderErrorType = builder.objectType(InvalidAuthProviderError, {
  name: 'InvalidAuthProviderError',
  description: 'An error raised when the user tries to log in with an invalid auth provider.',
  fields: (t) => ({
    message: t.exposeString('message'),
  }),
});
