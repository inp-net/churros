<script lang="ts">
  import { goto } from '$app/navigation';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { DISPLAY_VISIBILITIES, SHOP_PAYMENT_METHODS } from '$lib/display';
  import { toasts } from '$lib/toasts';
  import { PaymentMethod, zeus, type Visibility } from '$lib/zeus';
  import Alert from './Alert.svelte';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import InputDate from './InputDate.svelte';
  import InputField from './InputField.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputLydiaAccounts from './InputLydiaAccounts.svelte';
  import InputNumber from './InputNumber.svelte';
  import InputSelectMultiple from './InputSelectMultiple.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import InputText from './InputText.svelte';

  let serverError = '';
  let deleting = false;

  export let data: {
    id: string;
    uid: string;
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
    lydiaAccount?:
      | {
          id: string;
          name: string;
        }
      | undefined;
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
    if (data.paymentMethods.includes(PaymentMethod.Lydia) && !data.lydiaAccount) {
      serverError = 'Un compte Lydia est requis pour accepter les paiements par Lydia';
      return;
    }
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
          '__typename': true,
          '...on Error': { message: true },
          '...on MutationUpsertShopItemSuccess': {
            data: {
              uid: true,
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
    }

    if (upsertShopItem.__typename === 'MutationUpsertShopItemSuccess')
      await goto(`/groups/${upsertShopItem.data.group.uid}/shop/${upsertShopItem.data.uid}/`);
  }
</script>

<form on:submit|preventDefault={submit}>
  <div class="side-by-side">
    <section class="metadata">
      <h2>Infos</h2>
      <InputText required label="Nom" bind:value={data.name} />
      <InputNumber
        required
        label="Prix"
        bind:value={data.price}
        on:change={() => (data.price = Number.parseFloat(data.price.toFixed(2)))}
      />
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
        <InputSelectMultiple bind:selection={data.paymentMethods} options={SHOP_PAYMENT_METHODS} />
      </InputField>
      <InputLydiaAccounts
        required={Boolean(data.paymentMethods.includes(PaymentMethod.Lydia))}
        clearable
        bind:account={data.lydiaAccount}
        options={availableLydiaAccounts}
        label="Compte Lydia bénéficiaire"
      ></InputLydiaAccounts>
    </section>
    <section class="files"></section>
  </div>
  <section class="submit">
    {#if !deleting}
      {#if data.id !== ''}
        <ButtonSecondary
          danger
          on:click={() => {
            deleting = true;
          }}>Supprimer</ButtonSecondary
        >
      {/if}
      <ButtonPrimary submits>Enregistrer</ButtonPrimary>
      {#if serverError}
        <Alert theme="danger">{serverError}</Alert>
      {/if}
    {:else}
      <h2>Es-tu sûr·e ?</h2>
      <ButtonSecondary
        on:click={() => {
          deleting = false;
        }}>Annuler</ButtonSecondary
      >
      <ButtonSecondary
        on:click={async () => {
          deleting = false;
          const { deleteShopItem } = await $zeus.mutate({
            deleteShopItem: [
              { itemId: data.id, groupUid: data.group.uid },
              {
                '__typename': true,
                '...on Error': { message: true },
                '...on MutationDeleteShopItemSuccess': { data: true },
              },
            ],
          });
          if (deleteShopItem.__typename === 'Error') {
            toasts.error('Impossible de supprimer', deleteShopItem.message);
          } else {
            toasts.success('Article supprimé', `L'article ${data.name} a bien été supprimé`, {
              lifetime: 2500,
              showLifetime: true,
            });
            await goto(`/groups/${data.group.uid}/shop/`);
          }
        }}
        danger>Oui</ButtonSecondary
      >
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
</style>
