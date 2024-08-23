<script lang="ts">
  import { page } from '$app/stores';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputMajor from '$lib/components/InputMajor.svelte';
  import InputNumber from '$lib/components/InputNumber.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { LoadingChurros, allLoaded, loaded } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import { UpdateUserCurriculum } from '../mutations';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageUserEditCurriculum } = data);

  $: user = $PageUserEditCurriculum.data?.user;

  let graduationYear: number;
  $: if (loaded(user?.graduationYear)) graduationYear ??= user?.graduationYear;
  let majorUid: string;
  $: if (loaded(user?.major?.uid)) majorUid ??= user?.major?.uid ?? '';
  let apprentice: boolean;
  $: if (loaded(user?.apprentice)) apprentice ??= user?.apprentice ?? false;
</script>

<MaybeError result={$PageUserEditCurriculum} let:data>
  {@const user = data.user}
  <div class="contents">
    <form
      on:submit|preventDefault={async () => {
        const result = await mutate(UpdateUserCurriculum, {
          uid: $page.params.uid,
          major: majorUid || null,
          graduationYear: graduationYear || null,
          apprentice: apprentice ?? null,
          external: !majorUid,
        });
        toasts.mutation(
          result,
          'updateUserCurriculum',
          'Cursus mis à jour',
          'Impossible de mettre à jour le cursus',
        );
      }}
    >
      {#if !allLoaded(user)}
        <div class="loading">
          <LoadingChurros />
        </div>
        <p>Chargement…</p>
      {:else}
        <InputMajor
          clearable
          clearLabel="Rendre exté"
          bind:major={majorUid}
          options={data}
          initialSchool={null}
        >
          <ButtonSecondary
            on:click={() => {
              majorUid = '';
            }}
            slot="clear-button"
            danger
          >
            Rendre exté
          </ButtonSecondary>
        </InputMajor>
        {#if graduationYear}
          <InputNumber
            on:blur={async ({ currentTarget }) => {
              if (!(currentTarget instanceof HTMLInputElement)) return;
            }}
            label="Promo"
            bind:value={graduationYear}
          ></InputNumber>
        {/if}
        {#if apprentice !== undefined}
          <InputCheckbox bind:value={apprentice} label="Statut Apprenti (FISA)" />
        {/if}
        <section class="submit">
          <ButtonPrimary submits>Sauvegarder</ButtonPrimary>
        </section>
      {/if}
    </form>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-size: 5rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .submit {
    display: flex;
    justify-content: center;
  }
</style>
