<script lang="ts">
  import SimpleIconsFacebook from '~icons/simple-icons/facebook';
  import SimpleIconsInstagram from '~icons/simple-icons/instagram';
  import SimpleIconsTelegram from '~icons/simple-icons/telegram';
  import SimpleIconsTwitter from '~icons/simple-icons/twitter';

  export let name: string;
  export let value: string;

  const map = new Map([
    ['Facebook', SimpleIconsFacebook],
    ['Instagram', SimpleIconsInstagram],
    ['Telegram', SimpleIconsTelegram],
    ['Twitter', SimpleIconsTwitter],
  ]);

  /** Marks a variable as non null. */
  const bang = <T extends {}>(x?: T) => x!;
</script>

<a href={value} title={name} target="social">
  {#if map.has(name)}
    <svelte:component this={bang(map.get(name))} aria-label={name} />
  {:else}
    {name}
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
