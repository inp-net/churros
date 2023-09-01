<script lang="ts">
  import IconFacebook from '~icons/mdi/facebook-box';
  import type { SvelteComponent } from 'svelte';
  import IconInstagram from '~icons/mdi/instagram';
  import IconTwitter from '~icons/mdi/twitter';
  import IconLinkedin from '~icons/mdi/linkedin';
  import IconAnilist from '~icons/simple-icons/anilist';
  import IconGithub from '~icons/mdi/github';
  import IconHackernews from '~icons/mdi/hackernews';
  import IconDiscord from '~icons/mdi/discord';
  import BaseInputText from './BaseInputText.svelte';
  import InputField from './InputField.svelte';
  import { tooltip } from '$lib/tooltip';

  export let names = [
    'facebook',
    'instagram',
    'discord',
    'twitter',
    'linkedin',
    'github',
    'hackernews',
    'anilist',
  ] as const;
  export let initial: Array<{ name: (typeof names)[number]; value: string }> = names.map(
    (name) => ({
      name,
      value: '',
    })
  );
  export let value: typeof initial = initial;
  export let required = false;
  export let label: string;

  function index(name: string): number {
    return value.findIndex(({ name: n }) => n === name);
  }

  const NAME_TO_ICON: Record<(typeof names)[number], typeof SvelteComponent<any>> = {
    facebook: IconFacebook,
    instagram: IconInstagram,
    discord: IconDiscord,
    twitter: IconTwitter,
    linkedin: IconLinkedin,
    github: IconGithub,
    hackernews: IconHackernews,
    anilist: IconAnilist,
  };

  const DISPLAY_NAME: Record<(typeof names)[number], string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    hackernews: 'Hacker News',
    anilist: 'AniList',
    discord: 'Discord',
  };

  function urlToUsername({
    value: url,
    name,
  }: {
    value: string;
    name: (typeof names)[number];
  }): string {
    if (!url) return '';
    switch (name) {
      case 'instagram':
      case 'github':
      case 'twitter': {
        try {
          return decodeURIComponent(new URL(url).pathname.slice(1));
        } catch {
          return '';
        }
      }

      case 'anilist':
      case 'linkedin': {
        return decodeURIComponent(new URL(url).pathname.split('/')[2]) /* [1] is in/ */;
      }

      case 'hackernews': {
        return decodeURIComponent(new URL(url).searchParams.get('id') ?? '');
      }

      default: {
        return url;
      }
    }
  }

  function usernameToURL({
    value: username,
    name,
  }: {
    value: string;
    name: (typeof names)[number];
  }): string {
    username = username.trim();
    if (username.startsWith('@')) username = username.replace(/^@/, '');

    function makeURL(): URL | undefined {
      if (!username) return undefined;

      switch (name) {
        case 'instagram': {
          return new URL('/' + username, 'https://instagram.com');
        }

        case 'linkedin': {
          return new URL(`/in/${username}`, 'https://linkedin.com');
        }

        case 'twitter': {
          return new URL(`/${username}`, 'https://twitter.com');
        }

        case 'anilist': {
          return new URL(`/user/${username}`, 'https://anilist.co');
        }

        case 'github': {
          return new URL(`/${username}`, 'https://github.com');
        }

        case 'hackernews': {
          return new URL(`/user?id=${username}`, 'https://news.ycombinator.com');
        }

        case 'facebook':
        case 'discord': {
          return new URL(username);
        }

        default: {
          console.warn('Unknown social network, cannot construct URL from username');
          return url;
        }
      }
    }

    return makeURL()?.toString() ?? '';
  }
</script>

<InputField {label} {required}>
  <ul>
    {#each names as name}
      <li>
        <BaseInputText
          {required}
          type="text"
          value={urlToUsername(value[index(name)] ?? { name, value: '' })}
          on:input={({ detail }) => {
            value[index(name)] = {
              ...value[index(name)],
              value: usernameToURL({
                name,
                value: detail.target?.value,
              }),
            };
          }}
          placeholder={['discord', 'facebook'].includes(name)
            ? `Le lien vers la page ${DISPLAY_NAME[name]}`
            : `Ton @ sur ${DISPLAY_NAME[name]}`}
        >
          <svelte:element
            this={usernameToURL(value[index(name)] ?? { name, value: '' }) ? 'a' : 'div'}
            use:tooltip={DISPLAY_NAME[name]}
            class="icon"
            slot="before"><svelte:component this={NAME_TO_ICON[name]} /></svelte:element
          >
        </BaseInputText>
      </li>
    {/each}
  </ul>
</InputField>

<style lang="scss">
  ul {
    display: flex;
    flex-flow: column wrap;
    padding-left: 0;
    overflow: hidden;
    list-style: none;
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }

  ul > li:not(:last-child) {
    border-bottom: var(--border-block) solid var(--border);
  }

  ul > li > :global(.base-input) {
    border: none;
    border-radius: 0;
  }
</style>
