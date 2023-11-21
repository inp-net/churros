<script lang="ts">
  import { me } from '$lib/session.js';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { zeus } from '$lib/zeus';
  import InputText from '$lib/components/InputText.svelte';

  export let studentAssociation: undefined | { name: string } = undefined;

  export let contributionOptions: Array<{
    id: string;
    name: string;
    price: number;
    paysFor: Array<{
      id: string;
      name: string;
    }>;
    offeredIn: { uid: string; name: string };
  }>;

  export let pendingContributions: Array<
    | {
        id: string;
        name: string;
      }
    | undefined
  >;

  let contributeServerError = '';
  let contributeLoading: string | undefined = undefined;
  let contributePhone = $me?.phone ?? '';

  async function contribute(optionId: string) {
    contributeLoading = optionId;
    const { contribute } = await $zeus.mutate({
      contribute: [
        {
          optionId,
          phone: contributePhone,
        },
        {
          __typename: true,
          '...on Error': { message: true },
          '...on MutationContributeSuccess': { data: true },
        },
      ],
    });

    contributeLoading = undefined;
    if (contribute.__typename === 'Error') {
      contributeServerError = contribute.message;
    } else {
      contributeServerError = '';
      window.location.reload();
    }
  }

  function optionOfferedToUser(optionId: string) {
    const option = contributionOptions.find((o) => o.id === optionId);
    if (!option) return false;
    return $me?.major?.schools.some((school) => option.offeredIn.uid === school.uid);
  }

  async function cancelContribution(optionId: string) {
    contributeLoading = optionId;
    try {
      await $zeus.mutate({
        cancelPendingContribution: [{ optionId }, true],
      });
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      contributeServerError = `${error}`;
    }

    contributeLoading = undefined;
    window.location.reload();
  }
</script>

<div class="area-contributions">
  <InputText type="tel" label="Numéro de téléphone" bind:value={contributePhone} />
  <ul class="nobullet options">
    {#each contributionOptions.filter((o) => optionOfferedToUser(o.id)) as { name, price, id }}
      {@const pendingContribution = pendingContributions.find((c) => c?.id === id)}
      <li>
        <ButtonSecondary
          danger={Boolean(pendingContribution)}
          loading={contributeLoading === id}
          on:click={async () => {
            await (pendingContribution
              ? cancelContribution(pendingContribution.id)
              : contribute(id));
          }}
        >
          {#if pendingContribution}
            Annuler la demande pour {name}
          {:else}
            {name}
            <strong class="price"
              >{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                price,
              )}</strong
            >
          {/if}
        </ButtonSecondary>
      </li>
    {:else}
      <li class="empty">
        Tu ne peux pas cotiser {#if studentAssociation}pour {studentAssociation.name}{/if}
      </li>
    {/each}
  </ul>
  {#if contributeServerError}
    <Alert theme="danger">{contributeServerError}</Alert>
  {/if}
</div>

<style lang="scss">
  ul.options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .area-contributions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    margin: 1rem 0;
  }
</style>
