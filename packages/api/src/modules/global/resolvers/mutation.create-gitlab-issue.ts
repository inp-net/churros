import { builder, ENV } from '#lib';

import { GraphQLError } from 'graphql';

// TODO rename to submit-issue

builder.mutationField('createGitlabIssue', (t) =>
  t.field({
    type: 'Int',
    args: {
      title: t.arg.string(),
      description: t.arg.string(),
      isBug: t.arg.boolean(),
    },
    authScopes: () => true,
    async resolve(_, { title, description, isBug }, { user }) {
      if (!ENV.GITLAB_SUDO_TOKEN) throw new GraphQLError('Intégration à Gitlab désactivée');

      if (!URL.canParse(ENV.PUBLIC_REPOSITORY_URL)) throw new GraphQLError('URL de dépôt invalide');

      const gitlabDomain = new URL(ENV.PUBLIC_REPOSITORY_URL).host;
      const gitlabApiBaseUrl = `https://${gitlabDomain}/api/v4`;

      let hasGitlabAccount = false;
      if (user) {
        const data = (await fetch(`${gitlabApiBaseUrl}/users?username=${user.uid}`)
          .then(async (r) => r.json())
          .catch(() => {
            throw new GraphQLError(`Connexion à ${gitlabDomain} impossible`);
          })) as unknown as unknown[];
        hasGitlabAccount = data.length > 0;
      }

      const url = (path: string) => {
        const result = new URL(gitlabApiBaseUrl + path);
        result.searchParams.set('sudo', (hasGitlabAccount ? user?.uid : undefined) ?? 'issuebot');
        result.searchParams.set('private_token', ENV.GITLAB_SUDO_TOKEN!);

        return result.toString();
      };

      const response = await fetch(url(`/projects/${ENV.GITLAB_PROJECT_ID}/issues`), {
        method: 'POST',
        body: JSON.stringify({
          description:
            description +
            (hasGitlabAccount
              ? ''
              : `\n\n\n -- ${
                  user
                    ? `[@${user.uid}](https://${ENV.PUBLIC_FRONTEND_ORIGIN}/${user.uid})`
                    : 'Anonymous'
                }`),
          title: title || description.split('. ')[0],
          labels:
            [isBug ? 'bug' : 'feature'].join(',') +
            (!user || !user?.groups.some((g) => g.group.uid === 'devs') ? ',user-submitted' : ''),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: unknown = await response.json();

      if (response.ok) return (data as { iid: number }).iid;

      return 0;
    },
  }),
);
