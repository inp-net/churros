<script lang="ts">
  import { LinkType } from '$lib/zeus';
  import SimpleIconsFacebook from '~icons/simple-icons/facebook';
  import SimpleIconsInstagram from '~icons/simple-icons/instagram';
  import SimpleIconsTelegram from '~icons/simple-icons/telegram';
  import SimpleIconsTwitter from '~icons/simple-icons/twitter';

  export let type: LinkType;
  export let value: string;

  const map = new Map([
    [LinkType.Facebook, SimpleIconsFacebook],
    [LinkType.Instagram, SimpleIconsInstagram],
    [LinkType.Telegram, SimpleIconsTelegram],
    [LinkType.Twitter, SimpleIconsTwitter],
  ]);
</script>

<a href={value} title={type} target="social">
  {#if map.has(type)}
    <svelte:component this={map.get(type)} aria-label={type} />
  {:else}
    {type}
  {/if}
</a>

<style lang="scss">
  a {
    color: var(--muted);
    transition: outline 80ms ease-in, color 80ms ease-in;

    &:hover,
    &:focus-visible {
      color: var(--link);
    }
  }
</style>
