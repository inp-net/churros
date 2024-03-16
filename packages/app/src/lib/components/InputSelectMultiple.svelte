<script lang="ts">
  import IconCheck from '~icons/mdi/check';
  import IconMinus from '~icons/mdi/minus';
  export let name = '';
  export let options: string[] | Record<string, string> | string[][];
  export let selection: string[] = [];
  export let id: string | undefined = undefined;

  let optionsWithDisplay: Array<[string, string]> = [];
  $: optionsWithDisplay = Array.isArray(options)
    ? options.map((o) => (Array.isArray(o) ? (o.slice(0, 2) as [string, string]) : [o, o]))
    : Object.entries(options);
</script>

<fieldset {id}>
  {#each optionsWithDisplay as [value, display] (value)}
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
