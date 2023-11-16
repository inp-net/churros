<script lang="ts">
  import { PaymentMethod, Visibility, zeus } from '$lib/zeus';
  import { DISPLAY_PAYMENT_METHODS, DISPLAY_VISIBILITIES } from '$lib/display';
  import ButtonGhost from './ButtonGhost.svelte';
  import IconDelete from '~icons/mdi/delete-outline';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import InputFile from './InputFile.svelte';
  import InputDate from './InputDate.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputNumber from './InputNumber.svelte';
  import InputSelectMultiple from './InputSelectMultiple.svelte';
  import InputField from './InputField.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import InputText from './InputText.svelte';
  import InputLydiaAccounts from './InputLydiaAccounts.svelte';
  import { me } from '$lib/session';
  import { goto } from '$app/navigation';
  import Alert from './Alert.svelte';
  import { toasts } from '$lib/toasts';

  let files: FileList | undefined = undefined;

  let serverError = '';

  export let data: {
    id: string;
    name: string;
    price: number;
    stock: number;
    max: number;
    description: string;
    startsAt?: Date | undefined;
    endsAt?: Date | undefined;
    visibility: Visibility;
    paymentMethods: PaymentMethod[];
    group: {
      uid: string;
    };
    lydiaAccount: {
      id: string;
      name: string;
    };
  };

  export let availableLydiaAccounts: Array<{
    name: string;
    id: string;
    group?:
      | undefined
      | {
          pictureFile: string;
          pictureFileDark: string;
          name: string;
        };
  }>;

  async function submit() {
    serverError = '';
    const { upsertShopItem } = await $zeus.mutate({
      upsertShopItem: [
        {
          id: data.id,
          name: data.name,
          price: data.price,
          stock: data.stock,
          max: data.max,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
          description: data.description,
          paymentMethods: data.paymentMethods,
          groupUid: data.group.uid,
          lydiaAccounId: data.lydiaAccount?.id,
          visibility: data.visibility,
        },
        {
          __typename: true,
          '...on Error': { message: true },
          '...on MutationUpsertShopItemSuccess': {
            data: {
              id: true,
              name: true,
              price: true,
              max: true,
              description: true,
              startsAt: true,
              endsAt: true,
              paymentMethods: true,
              group: {
                uid: true,
              },
              lydiaAccount: {
                id: true,
                name: true,
              },
              visibility: true,
            },
          },
        },
      ],
    });
    if (upsertShopItem.__typename === 'Error') {
      serverError = upsertShopItem.message;
      toasts.error(`Impossible de sauvegarder`, serverError);
      return;
    }
  }
</script>

<form on:submit|preventDefault={submit}>
  <div class="side-by-side">
    <section class="metadata">
      <h2>Infos</h2>
      <InputText label="Nom" bind:value={data.name} />
      <InputNumber label="Prix" bind:value={data.price} />
      <InputNumber label="Stock" bind:value={data.stock} />
      <InputNumber label="Max" bind:value={data.max} />
      <InputDate time label="Début de la vente" bind:value={data.startsAt} />
      <InputDate time label="Fin de la vente" bind:value={data.endsAt} />
      <InputLongText label="Description" bind:value={data.description} />
      <InputSelectOne
        label="Visibilité"
        bind:value={data.visibility}
        options={DISPLAY_VISIBILITIES}
      />
      <InputField label="Méthodes de paiement">
        <InputSelectMultiple
          bind:selection={data.paymentMethods}
          options={DISPLAY_PAYMENT_METHODS}
        />
      </InputField>
      <InputLydiaAccounts
        clearable
        bind:account={data.lydiaAccount}
        options={availableLydiaAccounts}
        label="Compte Lydia bénéficiaire"
      ></InputLydiaAccounts>
    </section>
    <section class="files"></section>
  </div>
  <section class="submit">
    <ButtonPrimary submits>Enregistrer</ButtonPrimary>
    {#if serverError}
      <Alert theme="danger">{serverError}</Alert>
    {/if}
  </section>
</form>

<style>
  .side-by-side {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
  }

  section.metadata {
    max-width: 600px;
  }

  section.files {
    flex: 1;
  }

  h2 {
    margin-bottom: 1rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .submit {
    margin: 2rem auto 0;
    margin-top: 2rem;
    text-align: center;
  }

  .new-files {
    width: 100%;
    margin-top: 1rem;
  }

  .existing-file {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .existing-file .filename {
    margin-right: auto;
    text-align: left;
  }
</style>
