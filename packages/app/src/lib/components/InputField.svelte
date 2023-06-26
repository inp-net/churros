<script lang="ts">
  import IconAlertCircle from '~icons/mdi/alert-circle';
  import IconInfoCircle from '~icons/mdi/information';
  import { tooltip } from '$lib/tooltip';

  export let label: string;
  export let hint: string = '';
  export let id: string | null = null;
  export let required: boolean = false;
  export let errors: string[] | undefined = [];
</script>

<div class="field">
  <svelte:element this={id === null ? 'p' : 'label'} for={id}
    ><span class="label typo-field-label"
      >{label}{#if required}
        <span use:tooltip={'Ce champ est requis'} class="required-indicator">*</span>
      {/if}</span
    >
  </svelte:element>
  {#if errors && errors.length > 0}
    {#each errors as error}
      <span class="error">
        <IconAlertCircle aria-hidden="true" />
        {error}
      </span>
    {/each}
  {:else if hint}
    <span class="hint">
      <IconInfoCircle aria-hidden="true" />
      {hint}
    </span>
  {/if}
  <slot />
</div>

<style>
  .field {
    flex-grow: 1;
  }

  .label {
    display: inline-flex;
    justify-content: center;
    margin-bottom: 0.25rem;
  }

  .required-indicator {
    color: var(--sky);
    margin-left: 0.125rem;
    transform: scale(1.2) translateY(0.1em);
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
</style>
