<script lang="ts">
  import IconHome from '~icons/mdi/home';
  import Breadcrumb from './Breadcrumb.svelte';

  export let root = '';
</script>

<div class="breadcrumbs">
  {#if root}
    <Breadcrumb class="root" href={root}><IconHome></IconHome></Breadcrumb>
  {/if}
  <slot />
</div>

<style lang="scss">
  .breadcrumbs {
    display: flex;
    flex-wrap: wrap;
    gap: 0 0.5em;
    align-items: center;
    overflow: hidden;
  }

  .breadcrumbs :global(.root .icon) {
    height: 1.3em;
    margin-bottom: 0.1em;
  }
</style>
