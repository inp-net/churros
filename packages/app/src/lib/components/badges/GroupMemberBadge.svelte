<script lang="ts">
  // @ts-expect-error Untyped lib
  import isDarkColor from 'is-dark-color';

  export let groupMember: { group: { name: string; color: string }; title: string };
</script>

<span
  class="badge"
  style:--bg="{groupMember.group.color}80"
  style:--text={isDarkColor(groupMember.group.color) ? 'white' : 'black'}
>
  <span>{groupMember.group.name}</span>
  <span>{groupMember.title}</span>
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
