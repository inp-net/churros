<script lang="ts">
  import IconChevronRight from "~icons/mdi/chevron-right"
  export let href = ""
</script>

{#if href}
  <a {...$$restProps} {href}>
    <slot />
  </a>
  {:else}
  <slot></slot>
{/if}
<span class="separator" aria-hidden="true">
  <IconChevronRight></IconChevronRight>
</span>

<style lang="scss">
  .separator {
    &:last-of-type {
      display: none;
    }
  }
</style>
