<script lang="ts">
  import type { PageData } from './$types';
  import Card from '$lib/components/cards/Card.svelte';
  import IconPlus from '~icons/mdi/plus';
  import Button from '$lib/components/buttons/Button.svelte';

  export let data: PageData;

  const { lydiaAccountsOfGroup, group } = data;
</script>

<form>
  <fieldset>
    <legend>Comptes</legend>
    {#each lydiaAccountsOfGroup as { id, name } (id)}
      <Card>
        <svelte:fragment slot="header">
          {name}
        </svelte:fragment>
      </Card>
    {/each}
    <!-- Link to add an account -->
    <a href="/club/{group.uid}/edit/lydia">
      <Button type="button" theme="primary">
        <IconPlus />
        Ajouter un compte Lydia
      </Button>
    </a>
  </fieldset>
</form>
