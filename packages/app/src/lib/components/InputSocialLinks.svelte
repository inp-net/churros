<script lang="ts">
  import IconFacebook from '~icons/mdi/facebook-box';
  import type { SvelteComponent } from 'svelte';
  import IconInstagram from '~icons/mdi/instagram';
  import IconTwitter from '~icons/mdi/twitter';
  import IconMatrix from '~icons/mdi/matrix';
  import IconLinkedin from '~icons/mdi/linkedin';
  import IconDiscord from '~icons/mdi/discord';
  import IconSnapchat from '~icons/mdi/snapchat';
  import BaseInputText from './BaseInputText.svelte';
  import InputField from './InputField.svelte';

  export let names = [
    'facebook',
    'instagram',
    'twitter',
    'matrix',
    'linkedin',
    'discord',
    'snapchat',
  ] as const;
  export let initial: Array<{ name: typeof names[number]; value: string }> = names.map((name) => ({
    name,
    value: '',
  }));
  export let value: typeof initial = initial;
  export let required = false;
  export let label: string;

  function index(name: string): number {
    return value.findIndex(({ name: n }) => n === name);
  }

  const NAME_TO_ICON: Record<typeof names[number], typeof SvelteComponent> = {
    facebook: IconFacebook,
    instagram: IconInstagram,
    twitter: IconTwitter,
    matrix: IconMatrix,
    linkedin: IconLinkedin,
    discord: IconDiscord,
    snapchat: IconSnapchat,
  };

  function usernameToURL({
    value: username,
    name,
  }: {
    value: string;
    name: typeof names[number];
  }): string {
    username = username.trim();
    if (username.startsWith('@')) username = username.replace(/^@/, '');

    function makeURL(): URL | undefined {
      if (!username) return undefined;

      switch (name) {
        case 'facebook': {
          return new URL('/' + username, 'https://facebook.com');
        }

        case 'instagram': {
          return new URL('/' + username, 'https://instagram.com');
        }

        case 'linkedin': {
          return new URL(`/in/${username}`, 'https://linkedin.com');
        }

        case 'matrix': {
          return undefined;
        }

        case 'discord': {
          return undefined;
        }

        case 'snapchat': {
          return undefined;
        }

        case 'twitter': {
          return new URL(`/${username}`, 'https://twitter.com');
        }

        default: {
          console.warn('Unknown social network, cannot construct URL from username');
          return undefined;
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
          bind:value={value[index(name)].value}
          placeholder="@moi"
        >
          <svelte:element
            this={usernameToURL(value[index(name)]) ? 'a' : 'div'}
            title={name}
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
    list-style: none;
    padding-left: 0;
    display: flex;
    flex-flow: column wrap;
    border-radius: var(--radius-block);
    border: var(--border-block) solid var(--border);
    overflow: hidden;
  }

  ul > li:not(:last-child) {
    border-bottom: var(--border-block) solid var(--border);
  }

  ul > li > :global(.base-input) {
    border-radius: 0;
    border: none;
  }
</style>
