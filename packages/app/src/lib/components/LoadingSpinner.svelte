<script lang="ts">
  import IconSpinner from '~icons/mdi/loading';
</script>

<div class="loading-spinner">
  <IconSpinner />
</div>

<style>
  .loading-spinner {
    animation: spin 700ms ease infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(1turn);
    }
  }
</style>
