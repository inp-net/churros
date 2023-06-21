<script lang="ts">
  import IconClose from '~icons/mdi/close';
  import IconPlus from '~icons/mdi/plus';
  import IconChevronUp from '~icons/mdi/chevron-up';
  import GhostButton from '../buttons/GhostButton.svelte';
  import InputGroup from '../groups/InputGroup.svelte';

  export let value: Array<{ name: string; value: string }> = [];
</script>

<ul>
  {#each value as link, i}
    <li>
      <InputGroup>
        <input bind:value={link.name} />
        <input bind:value={link.value} />
      </InputGroup>
      <InputGroup>
        <GhostButton
          title="Supprimer"
          on:click={() => {
            value = value.filter((_, j) => i !== j);
          }}
        >
          <IconClose aria-label="Supprimer" />
        </GhostButton>
        {#if i > 0}
          <GhostButton
            title="Remonter"
            on:click={() => {
              value = [...value.slice(0, i - 1), value[i], value[i - 1], ...value.slice(i + 1)];
            }}
          >
            <IconChevronUp aria-label="Remonter" />
          </GhostButton>
        {/if}
      </InputGroup>
    </li>
  {/each}
  <li>
    <button
      type="button"
      on:click={() => {
        value = [...value, { name: '', value: '' }];
      }}><IconPlus aria-hidden="true" />Ajouter</button
    >
  </li>
</ul>

<style>
  ul {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
    padding-left: 0;
    list-style: none;
  }
</style>
