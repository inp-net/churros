<script lang="ts">
  import IconChevronRight from '~icons/mdi/chevron-right';
  import ButtonGhost from './ButtonGhost.svelte';
  export let href = '';
</script>

<div class="breadcrumb-item">
  <ButtonGhost {...$$restProps} {href} disabled={!href}>
    <slot />
  </ButtonGhost>
</div>
<span class="separator" aria-hidden="true">
  <IconChevronRight></IconChevronRight>
</span>

<style lang="scss">
  .separator {
    &:last-of-type {
      display: none;
    }
  }

  .breadcrumb-item :global(> button) {
    display: flex;
    gap: 0.25em;
    align-items: center;
  }
</style>
