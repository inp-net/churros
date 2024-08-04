<script lang="ts">
  import IconAlertCircle from '~icons/msl/error-outline';
  import IconInfoCircle from '~icons/msl/info-outline';
  import IconWarningCircle from '~icons/msl/warning-outline';
  import IconSucessCircle from '~icons/msl/check';
  import { tooltip } from '$lib/tooltip';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  export let label: string;
  export let hint = '';
  export let hintStyle: 'muted' | 'warning' | 'success' | 'loading' = 'muted';
  export let id: string | undefined = undefined;
  export let required = false;
  export let errors: string[] | undefined = [];
</script>

{#if label}
  <div class="field">
    <svelte:element this={id ? 'p' : 'label'} class="label-wrapper" {...$$restProps} for={id}
      ><p class="label typo-field-label">
        {label}{#if required}
          <span use:tooltip={'Ce champ est requis'} class="required-indicator">*</span>
        {/if}
      </p>
    </svelte:element>
    {#if errors && errors.length > 0}
      {#each errors as error}
        <span class="error">
          <IconAlertCircle aria-hidden="true" />
          {error}
        </span>
      {/each}
    {:else if hint || $$slots.hint}
      <span class="hint {hintStyle}">
        {#if hintStyle === 'loading'}
          <LoadingSpinner />
        {:else if hintStyle === 'warning'}
          <IconWarningCircle aria-hidden="true" />
        {:else if hintStyle === 'success'}
          <IconSucessCircle aria-hidden="true" />
        {:else}
          <IconInfoCircle aria-hidden="true" />
        {/if}
        <span class="hint-content">
          <slot name="hint" {hint}>{hint}</slot>
        </span>
      </span>
    {/if}
    <slot />
  </div>
{:else}
  <slot />
{/if}

<style>
  .field {
    flex-grow: 1;
  }

  .label-wrapper {
    line-height: 1;
  }

  .label {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.125rem;
    margin-left: calc(var(--radius-block) / 2);
    line-height: 1;
  }

  .required-indicator {
    margin-left: 0.26rem;
    color: var(--error);
    transform: scale(1.2) translateY(0.15em);
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

  .hint.warning {
    color: var(--warning);
  }

  .hint.success {
    color: var(--success);
  }
</style>
