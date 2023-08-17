<script lang="ts">
  import IconEditPen2Line from '~icons/mdi/pencil';
  import type { PageData } from './$types';
  import IconCheck from '~icons/mdi/check';
  import IconTrash from '~icons/mdi/delete-outline';
  import { zeus } from '$lib/zeus';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';

  export let data: PageData;

  // emails of registrations that are currently being accepted/refused
  let loadingRegistrations: string[] = [];

  $: userCandidates = data.userCandidates.edges.map(({ node }) => node);

  const removeRow = (email: string) => {
    data.userCandidates.edges = data.userCandidates.edges.filter(
      ({ node }) => node.email !== email
    );
  };

  async function decide(email: string, accept: boolean): Promise<void> {
    if (loadingRegistrations.includes(email)) return;

    try {
      loadingRegistrations.push(email);
      let result = false;
      if (accept) {
        ({ acceptRegistration: result } = await $zeus.mutate({
          acceptRegistration: [{ email }, true],
        }));
      } else {
        ({ refuseRegistration: result } = await $zeus.mutate({
          refuseRegistration: [{ email }, true],
        }));
      }

      if (result) removeRow(email);
    } finally {
      loadingRegistrations = loadingRegistrations.filter((e) => e !== email);
    }
  }
</script>

<h1>Demandes d'inscription</h1>
<ul class="nobullet registrations">
  {#each userCandidates as { email, fullName, major, graduationYear }}
    <li>
      <strong>{fullName}</strong>
      <span>{email} · <abbr title={major.name}>{major.shortName}</abbr> · {graduationYear}</span>
      <div class="actions">
        <ButtonSecondary icon={IconEditPen2Line} href="./edit/{encodeURIComponent(email)}"
          >Modifier</ButtonSecondary
        >
        <ButtonSecondary
          on:click={async () => {
            await decide(email, true);
          }}
          icon={IconCheck}
        >
          Accepter
        </ButtonSecondary>
        <ButtonSecondary
          on:click={async () => {
            await decide(email, false);
          }}
          icon={IconTrash}
          danger
        >
          Refuser
        </ButtonSecondary>
      </div>
    </li>
  {:else}
    <li>
      <div class="empty">
        Aucune demande d'inscription.
        <ruby>
          お<rt>o</rt>
          つ<rt>tsu</rt>
          か<rt>ka</rt>
          れ<rt>re</rt>
          さ<rt>sa</rt>
          ま<rt>ma</rt>
          で<rt>de</rt>
          す <rt>su</rt>
        </ruby>
        ～
      </div>
    </li>
  {/each}
</ul>

<style>
  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }

  ul {
    max-width: 1000px;
    margin: 0 auto;
  }

  .registrations {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
  }

  .registrations li {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-radius: var(--radius-block);
  }

  .registrations li .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }

  .registrations li:nth-child(odd) {
    background: var(--muted-bg);
  }
</style>
