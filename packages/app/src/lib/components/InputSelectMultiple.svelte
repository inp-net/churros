<script lang="ts">
  import IconCheck from '~icons/mdi/check';
  import IconMinus from '~icons/mdi/minus';
  export let name = '';
  export let options: string[] | Record<string, string>;
  export let selection: string[] = [];

  let optionsWithDisplay: Record<string, string> = {};
  $: optionsWithDisplay = Array.isArray(options)
    ? Object.fromEntries(options.map((option) => [option, option]))
    : options;
</script>

<fieldset>
  {#each Object.entries(optionsWithDisplay) as [value, display] (value)}
    <label aria-checked={selection.includes(value)}>
      <div class="icon">
        {#if selection.includes(value)}
          <IconCheck />
        {:else}
          <IconMinus />
        {/if}
      </div>
      <input type="checkbox" {name} bind:group={selection} {value} />
      {display}
    </label>
  {/each}
</fieldset>

<style>
  fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0;
    margin: 0;
    border: none;
  }

  label {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 1rem;
    cursor: pointer;
    background-color: transparent;
    border: var(--border-block) solid var(--border);
    border-radius: 10000px;
    transition: all 0.25s ease;
  }

  label[aria-checked='true'] {
    color: var(--primary-text);
    background-color: var(--primary-bg);
    border-color: var(--primary-border);
  }

  .icon {
    --size: 1.4em;

    display: flex;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    transition: all 0.25s ease;
  }

  .icon > :global(svg) {
    width: 100%;
    height: 100%;
  }

  input {
    display: none;
  }
</style>
