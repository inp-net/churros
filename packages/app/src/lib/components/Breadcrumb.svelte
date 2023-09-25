<script lang="ts">
  import IconChevronRight from "~icons/mdi/chevron-right"
    import ButtonGhost from "./ButtonGhost.svelte";
  export let href = ""
</script>

  <ButtonGhost {...$$restProps} {href} disabled={!href}>
    <slot />
  </ButtonGhost>
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
