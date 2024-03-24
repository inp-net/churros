<script lang="ts">
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import { tooltip as tooltip_ } from '$lib/tooltip';

  export let href: string | undefined;
  export let name: string;
  export let pictureFile: string;
  export let pictureFileDark: string;
  export let tooltip = '';
</script>

<svelte:element this={href ? 'a' : 'div'} class="avatar-group" {href} use:tooltip_={tooltip}>
  <img src={groupLogoSrc($isDark, { pictureFile, pictureFileDark })} alt={name} draggable="false" />
</svelte:element>

<style>
  .avatar-group {
    display: inline-block;
    width: 1.2em;
    height: 1.2em;
    overflow: hidden;
    font-weight: bold;
    color: var(--muted-text);
    text-align: center;
    background-color: var(--muted-bg);
    border-radius: var(--radius-inline);
    min-width: 2rem;
    min-height: 2rem;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    font-size: 1rem;
  }
</style>
