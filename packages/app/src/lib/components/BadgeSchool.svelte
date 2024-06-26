<script lang="ts">
  import { loading, onceLoaded, type MaybeLoading } from '$lib/loading';
  import LoadingText from '$lib/components/LoadingText.svelte';

  // @ts-expect-error Untyped lib
  import isDarkColor from 'is-dark-color';

  export let schools: Array<{
    name: MaybeLoading<string>;
    color: MaybeLoading<string>;
    uid: MaybeLoading<string>;
  }>;
</script>

<span class="badge">
  {#each schools as { name, color, uid }}
    <a
      href={onceLoaded(uid, (uid) => `/schools/${uid}`, '')}
      style:--bg={loading(color, '')}
      style:--text={onceLoaded(color, isDarkColor, false) ? 'white' : 'black'}
    >
      <LoadingText value={name}>Lorem</LoadingText>
    </a>
  {/each}
</span>

<style lang="scss">
  .badge {
    display: inline-flex;
    flex-wrap: wrap;
    overflow: hidden;
    vertical-align: bottom;
    border-radius: var(--radius-inline);

    > * {
      flex: 1;
      padding: 0 0.25em;
      color: var(--text);
      text-align: center;
      background: var(--bg);
    }

    > :first-child {
      padding-inline-start: 0.5em;
    }

    > :last-child {
      padding-inline-end: 0.5em;
    }
  }
</style>
