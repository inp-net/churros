import { builder } from '../builder.js';

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
      let hasGitlabAccount = false;
      if (user) {
        const data = (await fetch(`https://git.inpt.fr/api/v4/users?username=${user.uid}`).then(
          async (r) => r.json()
        )) as unknown as any[];
        hasGitlabAccount = data.length > 0;
      }

      const url = (path: string) => {
        const result = new URL('/api/v4/' + path, `https://git.inpt.fr/`);
        result.searchParams.set('sudo', (hasGitlabAccount ? user?.uid : undefined) ?? 'issuebot');
        result.searchParams.set('private_token', process.env.GITLAB_SUDO_TOKEN);
        return result.toString();
      };

      const response = await fetch(url(`/projects/${process.env.GITLAB_PROJECT_ID}/issues`), {
        method: 'POST',
        body: JSON.stringify({
          description:
            description +
            (hasGitlabAccount
              ? ''
              : `\n\n\n -- ${
                  user ? `[@${user.uid}](https://churros.inpt.fr/users/${user.uid})` : 'Anonymous'
                }`),
          title,
          labels: ['user-submitted', isBug ? 'bug' : 'feature'].join(','),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: unknown = await response.json();

      if (response.ok) return (data as { iid: number }).iid;

      return 0;
    },
  })
);
