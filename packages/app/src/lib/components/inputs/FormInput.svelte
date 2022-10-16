<script lang="ts">
  export let label: string;
  export let errors: string[] | undefined = undefined;
  export let hint = '';
  import MajesticonsAlertCircle from '~icons/majesticons/alert-circle';
  import MajesticonsInfoCircle from '~icons/majesticons/info-circle';
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label>
  <span class="label">{label}</span>
  {#if errors && errors.length > 0}
    {#each errors as error}
      <span class="error">
        <MajesticonsAlertCircle aria-hidden="true" />
        {error}
      </span>
    {/each}
  {:else if hint}
    <span class="hint">
      <MajesticonsInfoCircle aria-hidden="true" />
      {hint}
    </span>
  {/if}
  <span class="input"><slot /></span>
</label>

<style lang="scss">
  label {
    display: inline-flex;
    flex-direction: column;
    gap: 0.25em;
    width: 100%;
  }

  .error,
  .hint {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    font-size: 0.875em;
  }

  .error {
    color: var(--error);
  }

  .hint {
    color: var(--muted);
  }

  .input > :global(*) {
    display: flex;
    gap: 0.25em;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
</style>
