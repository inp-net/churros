<script lang="ts">
  import {
    fragment,
    graphql,
    PendingValue,
    type AreaContribute_StudentAssociation,
    type AreaContribute_User,
  } from '$houdini';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { allLoaded, loaded, loading } from '$lib/loading';
  import { toasts } from '$lib/toasts';

  function formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  export let studentAssociation: AreaContribute_StudentAssociation | null;
  $: data = fragment(
    studentAssociation,
    graphql(`
      fragment AreaContribute_StudentAssociation on StudentAssociation @loading {
        name
        contributionOptions {
          id
          name
          price
          paysFor {
            id
            name
          }
          offeredIn {
            uid
            name
          }
        }
      }
    `),
  );

  export let user: AreaContribute_User | null;
  $: Me = fragment(
    user,
    graphql(`
      fragment AreaContribute_User on User @loading {
        lydiaPhone
        major {
          schools {
            uid
          }
        }
        pendingContributions {
          id
          name
        }
      }
    `),
  );

  let contributeLoading: string | undefined = undefined;
  let contributePhone: string;
  $: contributePhone ||= loading($Me?.lydiaPhone, '') ?? '';

  const Contribute = graphql(`
    mutation Contribute($optionId: ID!, $phone: String!) {
      contribute(optionId: $optionId, phone: $phone) {
        ... on MutationContributeSuccess {
          data
        }
        ...MutationErrors
      }
    }
  `);

  async function contribute(optionId: string) {
    contributeLoading = optionId;
    const result = await Contribute.mutate({ optionId, phone: contributePhone });

    contributeLoading = undefined;
    if (toasts.mutation(result, 'contribute', '', 'Impossible de cotiser'))
      window.location.reload();
  }

  function optionOfferedToUser(optionId: string) {
    const option = $data?.contributionOptions.find((o) => o.id === optionId);
    if (!option) return false;
    return $Me?.major?.schools.some((school) => option.offeredIn.uid === school.uid);
  }

  const CancelContribution = graphql(`
    mutation CancelContribution($optionId: ID!) {
      cancelPendingContribution(optionId: $optionId) {
        ... on MutationCancelPendingContributionSuccess {
          data
        }
        ...MutationErrors
      }
    }
  `);

  async function cancelContribution(optionId: string) {
    contributeLoading = optionId;
    const result = await CancelContribution.mutate({ optionId });
    if (
      toasts.mutation(result, 'cancelPendingContribution', '', "Impossible d'annuler la cotisation")
    )
      window.location.reload();

    contributeLoading = undefined;
    window.location.reload();
  }
</script>

<div class="area-contributions">
  <InputText type="tel" label="Numéro de téléphone" bind:value={contributePhone} />
  <ul class="nobullet options">
    {#each ($data?.contributionOptions ?? []).filter((o) => loaded(o.id) && optionOfferedToUser(o.id)) as { name, price, id } (id)}
      {@const pendingContribution = $Me?.pendingContributions.find((c) => c?.id === id)}
      <li>
        <ButtonSecondary
          danger={Boolean(pendingContribution)}
          loading={contributeLoading === id}
          on:click={async () => {
            if (!allLoaded(pendingContribution) || !loaded(id)) return;
            await (pendingContribution
              ? cancelContribution(pendingContribution.id)
              : contribute(id));
          }}
        >
          {#if pendingContribution}
            Annuler la demande pour <LoadingText value={name}>Lorem ipsum</LoadingText>
          {:else}
            <LoadingText value={name}>Lorem ipsum</LoadingText>
            <strong class="price">
              <LoadingText value={loaded(price) ? formatPrice(price) : PendingValue}
                >10 €</LoadingText
              >
            </strong>
          {/if}
        </ButtonSecondary>
      </li>
    {:else}
      <li class="empty">
        Tu ne peux pas cotiser {#if $data}pour <LoadingText value={$data.name}
            >Lorem ipsum</LoadingText
          >{/if}
      </li>{/each}
  </ul>
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
