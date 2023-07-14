<script lang="ts">
  import type { PageData } from './$types';
  import FormGroup from '$lib/components/FormGroup.svelte';
  import FormPicture from '$lib/components/FormPicture.svelte';
  import Card from '$lib/components/Card.svelte';
  import IconPlus from '~icons/mdi/plus';
  import Button from '$lib/components/Button.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';

  export let data: PageData;

  $: ({ group, lydiaAccountsOfGroup } = data);
</script>

<h1><ButtonBack /> Éditer {group.name}</h1>

<a href="../members">Modifier les membres</a>

<FormPicture objectName="Group" bind:object={group} />
<FormGroup bind:data />

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

<style>
  h1 {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>
