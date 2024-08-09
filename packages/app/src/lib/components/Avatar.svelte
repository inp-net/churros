<script lang="ts">
  import { loading, type MaybeLoading } from '$lib/loading';
  import { tooltip } from '$lib/tooltip';

  export let notooltip = false;
  export let src: MaybeLoading<string>;
  export let href: MaybeLoading<string>;
  export let help: MaybeLoading<string>;
  export let alt: MaybeLoading<string> = 'Photo de profil';
  /** Indicate that this avatar has to show a "selected" state */
  export let selected = false;
  /** Indicate that this avatar can be selected */
  export let selectable = false;
</script>

<a
  class:selectable
  class:selected
  href={loading(href, '') || undefined}
  use:tooltip={notooltip ? undefined : loading(help, undefined)}
>
  <img src={loading(src, '')} alt={loading(alt, 'Photo de profil')} />
</a>

<style>
  a {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--avatar-size, 1em);
    height: var(--avatar-size, 1em);
    overflow: hidden;
    border: var(--avatar-border, none);
    border-radius: var(--avatar-radius, 10000px);
    transition: all 50ms ease;
  }

  a.selectable {
    outline: calc(2 * var(--border-block)) solid transparent;
  }

  a.selectable:not(.selected):is(:hover, :focus-visible) {
    outline: calc(2 * var(--border-block)) solid var(--primary);
  }

  a.selected {
    outline: calc(4 * var(--border-block)) solid var(--primary);
  }

  img {
    width: 100%;
    height: 100%;
    font-size: 0.5rem;
    color: var(--shy);
    text-align: center;
    object-fit: cover;
    object-position: center;
    background: var(--bg);
  }
</style>
