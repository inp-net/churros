<script context="module" lang="ts">
  import type { Load } from './__types/';
  import { mutate, Query, query, ZeusError, type PropsType } from '$lib/zeus';
  import { session } from '$app/stores';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/buttons/Button.svelte';

  const propsQuery = () => Query({ schools: { id: true, name: true } });

  type Props = PropsType<typeof propsQuery>;

  export const load: Load = async ({ fetch, session }) =>
    session.me?.canEditClubs
      ? { props: await query(fetch, propsQuery(), session) }
      : { status: 307, redirect: '..' };
</script>

<script lang="ts">
  export let schools: Props['schools'];

  let name = '';
  let schoolId = schools[0].id;

  let loading = false;
  const createClub = async () => {
    if (loading) return;

    try {
      loading = true;
      const { createClub: club } = await mutate(
        { createClub: [{ name, schoolId }, { id: true }] },
        $session
      );
      await goto(`/club/${club.id}`);
    } catch (error: unknown) {
      if (!(error instanceof ZeusError)) throw error;
    } finally {
      loading = false;
    }
  };
</script>

<form on:submit|preventDefault={createClub}>
  <p>
    <label>Nom du club&nbsp;: <input type="text" bind:value={name} required /></label>
  </p>
  <p>
    <label>
      École&nbsp;:
      <select id="school" bind:value={schoolId}>
        {#each schools as { id, name }}
          <option value={id}>{name}</option>
        {/each}
      </select>
    </label>
  </p>
  <Button type="submit" theme="primary" {loading}>Créer le club</Button>
</form>

<style lang="scss">
  input,
  select {
    display: block;
    width: 100%;
  }
</style>
