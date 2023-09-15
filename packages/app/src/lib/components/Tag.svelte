<script lang="ts">
  // @ts-expect-error Untyped lib
  import isDarkColor from 'is-dark-color';
  import { tooltip } from '$lib/tooltip';

  export let name: string;
  export let color: string;
  export let href: string;
  export let description: string = '';
</script>

    <a
      class="badge"
      href={href}
      style:--bg={color}
      style:--text={isDarkColor(color) ? 'white' : 'black'}
      use:tooltip={description}
    >
      {name}
    </a>

<style lang="scss">
  .badge {
    overflow: hidden;
    vertical-align: bottom;
    border-radius: var(--radius-inline);
    padding: 0.1em 0.25em;
    color: var(--text);
    text-align: center;
    background: var(--bg);
  }
</style>
