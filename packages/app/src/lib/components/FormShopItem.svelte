<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PaymentMethod$options, Visibility$options } from '$houdini';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { DISPLAY_VISIBILITIES, SHOP_PAYMENT_METHODS } from '$lib/display';
  import { toasts } from '$lib/toasts';
  import { zeusVisibility, zeusPaymentMethod } from '$lib/typing';
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
  import InputToggle from './InputToggleWithLabel.svelte';

  export let data: {
    id: string;
    uid: string;
    name: string;
    price: number;
    stock: number;
    max: number;
    description: string;
    startsAt?: Date | undefined | null;
    endsAt?: Date | undefined | null;
    visibility: Visibility | Visibility$options;
    paymentMethods: Array<PaymentMethod | PaymentMethod$options>;
    itemOptions: {
      id: string;
      name: string;
      options: string[];
      required: boolean;
      otherToggle: boolean;
    }[];
    group: {
      uid: string;
    };
    lydiaAccount?:
      | {
          id: string;
          name: string;
        }
      | undefined
      | null;
  };

  export let availableLydiaAccounts: Array<{
    name: string;
    id: string;
    group?:
      | undefined
      | null
      | {
          pictureFile: string;
          pictureFileDark: string;
          name: string;
        };
  }>;

  let serverError = '';
  let deleting = false;
  const newOption: string[] = [];
  const optionToDeleteIds: string[] = [];

  for (const _ of data.itemOptions) newOption.push('');

  async function submit() {
    serverError = '';
    if (data.paymentMethods.includes(PaymentMethod.Lydia) && !data.lydiaAccount) {
      serverError = 'Un compte Lydia est requis pour accepter les paiements par Lydia';
      return;
    }
    for (const itemOption of data.itemOptions)
      itemOption.options = itemOption.options.filter((option) => option !== '');
    //filter duplicates as well
    data.itemOptions = data.itemOptions.filter((itemOption, index) => {
      const firstIndex = data.itemOptions.findIndex((o) => o.name === itemOption.name);
      return firstIndex === index;
    });

    if (optionToDeleteIds.length > 0) {
      await $zeus.mutate({
        deleteShopOption: [{ optionIds: optionToDeleteIds }, true],
      });
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
          paymentMethods: data.paymentMethods.map(zeusPaymentMethod),
          groupUid: data.group.uid,
          lydiaAccounId: data.lydiaAccount?.id,
          visibility: zeusVisibility(data.visibility),
        },
        {
          '__typename': true,
          '...on Error': { message: true },
          '...on ZodError': { message: true },
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

    if (upsertShopItem.__typename === 'MutationUpsertShopItemSuccess') {
      await $zeus.mutate({
        upsertShopOptions: [
          {
            shopItemId: data.id || upsertShopItem.data.id,
            itemOptions: data.itemOptions,
          },
          true,
        ],
      });
    }

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
      <div class="option-input">
        <div class="option-header">
          <p>Options</p>
          <ButtonSecondary
            on:click={() => {
              data.itemOptions = [
                ...data.itemOptions,
                {
                  id: '',
                  name: '',
                  options: [],
                  required: false,
                  otherToggle: false,
                },
              ];
              newOption.push('');
            }}
            >Ajouter une option
          </ButtonSecondary>
        </div>
        {#each data.itemOptions as itemOption, i}
          <div class="option-title">
            <InputText
              label="Nom du choix"
              bind:value={itemOption.name}
              required={itemOption.options.length > 0 ||
                itemOption.required ||
                itemOption.otherToggle}
              on:focusout={() => {
                if (itemOption.options.length === 0 && itemOption.name === '') {
                  optionToDeleteIds.push(itemOption.id);
                  data.itemOptions = data.itemOptions.filter((o) => o !== itemOption);
                }
              }}
            />
            <div class="toggles">
              <InputToggle label={'Rendre obligatoire'} bind:value={itemOption.required} />
              <InputToggle label={"Autoriser champ 'autre'"} bind:value={itemOption.otherToggle} />
            </div>
          </div>
          <ul class="nobullet option">
            <p>Options possibles</p>
            {#each itemOption.options as option}
              <li>
                <InputText
                  label=""
                  bind:value={option}
                  on:focusout={() => {
                    if (option === '')
                      itemOption.options = itemOption.options.filter((o) => o !== option);
                  }}
                />
              </li>
            {/each}
            <li class="option new">
              <div class="fake-input"></div>
              <InputText
                on:blur={() => {
                  if (newOption[i] !== '' && !itemOption.options.includes(newOption[i])) {
                    itemOption.options = [...itemOption.options, newOption[i]];
                    newOption[i] = '';
                  }
                }}
                bind:value={newOption[i]}
                label=""
                placeholder="Nouvelle valeur de {itemOption.name}"
              />
            </li>
          </ul>
        {/each}
      </div>
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
                '...on ZodError': { message: true },
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

  .option-input {
    padding: 1em 0;
  }

  .option-header {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .option-title {
    display: flex;
    gap: 1em;
    align-items: end;
  }

  .toggles {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .option > li + li {
    margin-top: 10px;
  }

  @media only screen and (max-width: 600px) {
    .option-title {
      display: block;
    }

    .toggles {
      padding: 0.5rem 0;
    }
  }
</style>
