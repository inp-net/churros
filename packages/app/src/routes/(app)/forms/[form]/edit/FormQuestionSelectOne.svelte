<script lang="ts">
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import IconDelete from '~icons/mdi/close';
  import IconMoveUp from '~icons/mdi/arrow-up';
  import IconMoveDown from '~icons/mdi/arrow-down';

  export let options: string[];
  let newOption = '';

  function move(choice: string, indexDelta: number) {
    const index = options.indexOf(choice);
    if (index === -1) return;
    const newIndex = index + indexDelta;
    if (newIndex < 0 || newIndex >= options.length) return;
    options = [...options];
    options.splice(index, 1);
    options.splice(newIndex, 0, choice);
  }
</script>

<h3>Choix possibles</h3>
<ul class="nobullet">
  {#each options as option}
    <li class="option">
      <InputText label="" value={option} />
      <div class="actions">
        <ButtonGhost
          on:click={() => {
            options = options.filter((o) => o !== option);
          }}
          help="Supprimer"
        >
          <IconDelete></IconDelete>
        </ButtonGhost>
        <ButtonGhost
          on:click={() => {
            move(option, -1);
          }}
          help="Monter"
          disabled={options.indexOf(option) === 0}
        >
          <IconMoveUp></IconMoveUp>
        </ButtonGhost>
        <ButtonGhost
          on:click={() => {
            move(option, +1);
          }}
          help="Descendre"
          disabled={options.indexOf(option) === options.length - 1}
        >
          <IconMoveDown></IconMoveDown>
        </ButtonGhost>
      </div>
    </li>
  {/each}
  <li class="option new">
    <InputText
      on:blur={() => {
        console.log({ newOption, options });
        if (newOption && !options.includes(newOption)) {
          console.log('Adding new option', newOption);
          options = [...options, newOption];
          newOption = '';
        }
      }}
      bind:value={newOption}
      label=""
      placeholder="Nouvelle option"
    />
  </li>
</ul>

<style>
  h3 {
    margin-bottom: 0.5em;
  }
  ul {
    display: flex;
    flex-direction: column;
    row-gap: 0.5em;
  }
  .option {
    column-gap: 0.5em;
  }
  .option,
  .option .actions {
    display: flex;
    align-items: center;
  }
</style>
