<script lang="ts">
  export let group: string | undefined = undefined;
  export let options: string[] | Record<string, string> = {};

  let optionsWithDisplay: Record<string, string> = {};
  $: optionsWithDisplay = Array.isArray(options)
    ? Object.fromEntries(options.map((option) => [option, option]))
    : options;
</script>

{#each Object.entries(optionsWithDisplay) as [value, label] (value)}
  <label class="input-radio" aria-current={value === group}>
    <input type="radio" {value} bind:group />
    {label}
  </label>
{/each}

<style>
  input[type='radio'] {
    display: none;
  }

  label {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0.25rem;
    padding-left: 2.5rem;
    cursor: pointer;
  }

  label::before,
  label::after {
    position: absolute;
    left: 0;
    box-sizing: border-box;
    display: block;
    width: 2rem;
    height: 2rem;
    content: '';
    border-radius: 1rem;
  }

  label::before {
    background-color: var(--bg);
    border: 0.15rem solid var(--text);
  }

  label[aria-current='true']::after {
    border: 0.9rem solid var(--text);
  }
</style>
