<script lang="ts">
  import { loading, type MaybeLoading } from '$lib/loading';
  import { tooltip } from '$lib/tooltip';

  export let src: MaybeLoading<string>;
  export let href: MaybeLoading<string>;
  export let help: MaybeLoading<string>;
  export let alt: MaybeLoading<string> = 'Photo de profil';
</script>

<a href={loading(href, '')} use:tooltip={loading(help, undefined)}>
  <img src={loading(src, '')} alt={loading(alt, 'Photo de profil')} />
</a>

<style>
  a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--avatar-size, 1em);
    height: var(--avatar-size, 1em);
    overflow: hidden;
    border-radius: 100000px;
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
