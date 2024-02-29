<script lang="ts">
  import { fragment, type BadgeGroupMember, graphql } from '$houdini';

  export let href = '';

  export let groupMember: BadgeGroupMember;
  $: GroupMember = fragment(
    groupMember,
    graphql`
      fragment BadgeGroupMember on GroupMember {
        group {
          name
          color
        }
        title
        emoji
      }
    `,
  );

  $: ({ group, title, emoji } = $GroupMember);
</script>

<svelte:element this={href ? 'a' : 'span'} {href} class="badge">
  {#if emoji}
    <span class="role-badge">{emoji}</span>
  {/if}
  <span>{group.name}</span>
  {#if title.toLowerCase() !== 'membre'}
    <span class="title">({title})</span>
  {/if}
</svelte:element>

<style lang="scss">
  .badge {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.25em 0.75em;
    overflow: hidden;
    color: var(--primary-text);
    background: var(--primary-bg);
    border-radius: 100000px;

    &:hover {
      color: var(--primary-hover-text);
      background: var(--primary-hover-bg);
    }
  }

  .title {
    font-size: 0.8em;
    font-weight: bold;
    opacity: 0.8;
  }
</style>
