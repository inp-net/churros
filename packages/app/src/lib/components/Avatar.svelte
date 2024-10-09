<script lang="ts">
  import { Lightbox } from 'svelte-lightbox';
  import { loaded, loading, type MaybeLoading } from '$lib/loading';
  import { tooltip } from '$lib/tooltip';

  export let notooltip = false;
  export let src: MaybeLoading<string>;
  export let href: MaybeLoading<string>;
  /** Indicate that clicking should show a large version of the picture instead of going to href */
  export let enlarge = false;
  export let help: MaybeLoading<string>;
  export let alt: MaybeLoading<string> = 'Photo de profil';
  /** Indicate that this avatar has to show a "selected" state */
  export let selected = false;
  /** Indicate that this avatar can be selected */
  export let selectable = false;
</script>

<svelte:element
  this={enlarge ? 'div' : 'a'}
  class="avatar"
  class:selectable
  class:selected
  href={loading(href, '') || undefined}
  use:tooltip={notooltip ? undefined : loading(help, undefined)}
  class:skeleton-effect-wave={!loaded(src)}
>
  {#if enlarge}
    <Lightbox
      transitionDuration={50}
      customization={{
        lightboxProps: {
          'data-object': 'avatar',
        },
      }}
    >
      <img src={loading(src, '')} alt={loading(alt, 'Photo de profil')} />
    </Lightbox>
  {:else}
    <img src={loading(src, '')} alt={loading(alt, 'Photo de profil')} />
  {/if}
</svelte:element>

<style>
  .avatar {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--avatar-size, 1em);
    height: var(--avatar-size, 1em);
    overflow: hidden;
    border: var(--avatar-border, none);
    border-radius: var(--avatar-radius, 10000px);
    transition: all 50ms ease;
  }

  .avatar.selectable {
    outline: calc(2 * var(--border-block)) solid transparent;
  }

  .avatar.selectable:not(.selected):is(:hover, :focus-visible) {
    outline: calc(2 * var(--border-block)) solid var(--primary);
  }

  .avatar.selected {
    outline: calc(4 * var(--border-block)) solid var(--primary);
  }

  :global(.svelte-lightbox-main[data-object='avatar'] .svelte-lightbox-body) {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    margin: 0 4rem;
    overflow: hidden;
    border-radius: var(--avatar-radius, 10000px);
    transition: all 50ms ease;
  }

  img {
    width: 100%;
    height: 100%;
    font-size: 0.5rem;
    color: var(--shy);
    text-align: center;
    object-fit: cover;
    object-position: center;
    background: var(--avatar-background, var(--bg2));
  }
</style>
