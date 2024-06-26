<script lang="ts">
  import {
    fragment,
    graphql,
    PendingValue,
    type AreaContribute_StudentAssociation,
    type AreaContribute_User,
  } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { allLoaded, loaded, onceLoaded } from '$lib/loading';
  import { me } from '$lib/session.js';
  import { zeus } from '$lib/zeus';

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
        phone
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

  let contributeServerError = '';
  let contributeLoading: string | undefined = undefined;
  $: contributePhone = onceLoaded($Me?.phone, (phone) => phone ?? '', '');

  async function contribute(optionId: string) {
    contributeLoading = optionId;
    const { contribute } = await $zeus.mutate({
      contribute: [
        {
          optionId,
          phone: contributePhone,
        },
        {
          '__typename': true,
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
    const option = $data?.contributionOptions.find((o) => o.id === optionId);
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
