<script lang="ts">
  import AvatarSchool from '$lib/components/AvatarSchool.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import IconDelete from '~icons/mdi/delete-outline';
  import IconQRCode from '~icons/mdi/qrcode';
  import { formatDateTime } from '$lib/dates';
  import type { PageData } from './$types';
  import { zeus } from '$lib/zeus';
  import { toasts } from '$lib/toasts';
  import { page } from '$app/stores';

  export let data: PageData;
</script>

<div class="content">
  <main>
    <h1>
      <ButtonBack />
      Liens d'inscription rapide
      <ButtonPrimary href="../create">Créer un nouveau lien</ButtonPrimary>
    </h1>

    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>École</th>
          <th>Valide jusqu'au</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each data.quickSignups.nodes ?? [] as { code, validUntil, school } (code)}
          <tr id={code} class:highlighted={$page.url.hash === `#${code}`}>
            <td><a href="#{code}"><code>{code}</code></a></td>
            <td><AvatarSchool {...school}></AvatarSchool></td>
            <td
              >{#if validUntil}{formatDateTime(validUntil)}{:else}—{/if}</td
            >
            <td
              ><ButtonSecondary
                on:click={async () => {
                  await $zeus.mutate({
                    deleteQuickSignup: [{ code }, { __typename: true }],
                  });
                  toasts.success("Lien d'inscription rapide supprimé");
                  data.quickSignups.nodes = data.quickSignups.nodes.filter((n) => n.code !== code);
                }}
                icon={IconDelete}
                danger>Supprimer</ButtonSecondary
              >
            </td>
            <td><ButtonSecondary href="../qr/{code}" icon={IconQRCode}>QR Code</ButtonSecondary></td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  </main>
</div>

<style>
  th {
    text-align: left;
  }

  td,
  th {
    height: 3.5rem;
    padding: 0.5rem;
  }

  tr {
    border-radius: var(--radius-block);
  }

  tr.highlighted {
    color: var(--primary-text);
    background-color: var(--primary-bg);
  }

  tr:not(:hover, .highlighted) :global(.button-secondary) {
    display: none;
  }
</style>
