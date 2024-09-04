<script lang="ts">
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import IconClear from '~icons/mdi/clear-circle-outline';

  export let label: string;
  export let required = false;
  export let hint = '';
  export let errors: string[] = [];
  export let value: number | null;
  export let minimum: number;
  export let maximum: number;
  export let minimumLabel: string;
  export let maximumLabel: string;
  export let name = '';
  export let id = name;
  export let disabled = false;
  export let noHint = false;
</script>

<InputField {label} {required} {hint} {errors}>
  <div class="range-input">
    <span class="label label-min typo-details">
      <slot value={minimum} label={minimumLabel} name="minimum">
        {#if minimumLabel}
          {minimumLabel}
          <!-- <span class="muted">({minimum})</span> -->
        {:else}
          {minimum}
        {/if}
      </slot>
    </span>
    <span class="label label-max typo-details">
      <slot value={maximum} label={maximumLabel} name="maximum">
        {#if maximumLabel}
          {maximumLabel}
          <!-- <span class="muted">({maximum})</span> -->
        {:else}
          {maximum}
        {/if}
      </slot>
    </span>
  </div>
  {#if value === null}
    <input type="hidden" name="{name}/no-answer" value="" />
  {/if}
  <input
    type="range"
    {disabled}
    value={value ?? 0}
    on:input={(e) => {
      if (!(e.target instanceof HTMLInputElement)) return;
      value = Number.parseInt(e.target.value, 10);
    }}
    {name}
    {id}
    min={minimum}
    max={maximum}
    step="1"
  />
  {#if !noHint}
    <p class="current-value-hint">
      {#if value === null}
        <em>Sans réponse</em>
      {:else}
        {value}/{maximum}
      {/if}
      {#if !required}
        <ButtonGhost
          help="Effacer la réponse"
          disabled={value === null}
          on:click={() => {
            value = null;
          }}><IconClear></IconClear></ButtonGhost
        >
      {/if}
    </p>
  {/if}
</InputField>

<style>
  .range-input {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: -1rem;
  }

  .label {
    overflow: hidden;
    font-size: 1.1em;
    text-overflow: ellipsis;
    white-space: pre;
  }

  .current-value-hint {
    width: 4ch;
    width: 100%;
    text-align: right;
  }

  input {
    flex: 1;
    width: 100%;
    min-width: 0;
  }
</style>
