<script lang="ts">
  export let href = '';
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

<svelte:element this={href ? 'a' : 'span'} {href} class="badge">
  {#if roleBadge}
    <span class="role-badge">{roleBadge}</span>
  {/if}
  <span>{groupMember.group.name}</span>
  {#if groupMember.title.toLowerCase() !== 'membre'}
    <span class="title">({groupMember.title})</span>
  {/if}
</svelte:element>

<style lang="scss">
  .badge {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.25em 0.75em;
    overflow: hidden;
    color: var(--bg);
    background: var(--primary);
    border-radius: 100000px;
    outline: 0 solid var(--primary-bg);

    &:hover {
      outline: 2px solid var(--primary-bg);
    }
  }

  .title {
    font-size: 0.8em;
    font-weight: bold;
    opacity: 0.8;
  }
</style>
