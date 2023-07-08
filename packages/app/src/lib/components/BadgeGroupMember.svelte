<script lang="ts">
  // @ts-expect-error Untyped lib
  import isDarkColor from 'is-dark-color';

  export let groupMember: {
    group: { name: string; color: string };
    title: string;
    president: boolean;
    treasurer: boolean;
    vicePresident: boolean;
    secretary: boolean;
  };
  $: roleBadge = groupMember.president
    ? '👑'
    : groupMember.treasurer
    ? '💰'
    : groupMember.vicePresident
    ? '🌟'
    : groupMember.secretary
    ? '📜'
    : '';
</script>

<span
  class="badge"
  style:--bg="{groupMember.group.color}80"
  style:--text={isDarkColor(groupMember.group.color) ? 'white' : 'black'}
>
  {#if roleBadge}
    <span class="badge">{roleBadge}</span>
  {/if}
  <span>{groupMember.group.name}</span>
  {#if groupMember.title.toLowerCase() !== 'membre'}
    <span>{groupMember.title}</span>
  {/if}
</span>

<style lang="scss">
  .badge {
    display: inline-flex;
    overflow: hidden;
    color: var(--text);
    background: var(--bg);
    border-radius: var(--radius-inline);

    > :first-child {
      padding: 0.25rem 0.25rem 0.25rem 0.5rem;
      font-weight: bold;
      background: var(--bg);
    }

    > :last-child {
      padding: 0.25rem 0.5rem 0.25rem 0.25rem;
    }
  }
</style>
