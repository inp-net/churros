<script lang="ts">
  import { Selector, zeus } from '$lib/zeus';
  import InputText from './InputText.svelte';
  import IconClear from '~icons/mdi/clear';
  import InputDate from './InputDate.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import InputLongText from './InputLongText.svelte';
  import { me } from '$lib/session';
  import InputSearchObjectList from './InputSearchObjectList.svelte';
  import Fuse from 'fuse.js';
  import InputField from './InputField.svelte';
  import InputNumber from './InputNumber.svelte';

  const userQuery = Selector('User')({
    uid: true,
    firstName: true,
    lastName: true,
    fullName: true,
    nickname: true,
    description: true,
    pictureFile: true,
    address: true,
    graduationYear: true,
    majorId: true,
    phone: true,
    birthday: true,
    email: true,
    links: { name: true, value: true },
    notificationSettings: {
      id: true,
      type: true,
      allow: true,
      group: {
        id: true,
        uid: true,
        name: true,
        pictureFile: true,
      },
    },
    contributesTo: {
      id: true,
      name: true,
    },
  });

  export let data: {
    user: {
      address: string;
      description: string;
      graduationYear: number;
      links: Array<{ name: string; value: string }>;
      majorId: string;
      nickname: string;
      phone: string;
      firstName: string;
      lastName: string;
      email: string;
      birthday: Date | null;
      uid: string;
      contributesTo: Array<{ id: string; name: string }>;
    };
  };

  export let studentAssociations: Array<{
    id: string;
    name: string;
  }>;

  // We don't want form bindings to be reactive to let them evolve separately from the data
  let {
    user: {
      address,
      description,
      graduationYear,
      links,
      majorId,
      nickname,
      phone,
      firstName,
      lastName,
      email,
      // See https://github.com/graphql-editor/graphql-zeus/issues/262
      // eslint-disable-next-line unicorn/no-null
      birthday = null,
      contributesTo,
    },
  } = data;

  $: canEditContributions = Boolean($me?.canEditUsers);

  let loading = false;
  const updateUser = async () => {
    if (loading) return;
    try {
      loading = true;
      const { updateUser } = await $zeus.mutate({
        updateUser: [
          {
            uid: data.user.uid,
            nickname,
            description,
            links,
            address,
            graduationYear,
            majorId,
            phone,
            birthday,
            email,
            contributesTo: canEditContributions ? contributesTo.map((c) => c.id) : undefined,
          },
          {
            __typename: true,
            '...on Error': { message: true },
            '...on MutationUpdateUserSuccess': { data: userQuery },
          },
        ],
      });

      if (updateUser.__typename === 'Error') {
        console.error(updateUser.message);
        return;
      }

      // eslint-disable-next-line unicorn/no-null
      data.user = { ...data.user, ...updateUser.data, birthday: updateUser.data.birthday ?? null };
    } finally {
      loading = false;
    }
  };
</script>

<form on:submit|preventDefault={updateUser}>
  <div class="side-by-side">
    <InputText required label="Prénom" bind:value={firstName} />
    <InputText required label="Nom de famille" bind:value={lastName} />
    <InputText label="Surnom" bind:value={nickname} />
  </div>
  <InputLongText rich label="Description" bind:value={description} />
  {#if canEditContributions}
    <InputField label="Cotisant à">
      <InputSearchObjectList
        bind:objects={contributesTo}
        values={contributesTo.map(({ id }) => id)}
        labelKey="name"
        valueKey="id"
        search={(query) =>
          new Fuse(studentAssociations, {
            keys: ['name', 'id'],
          })
            .search(query)
            .map((r) => r.item)}
      />
    </InputField>
    <InputNumber label="Promo" bind:value={graduationYear} />
  {/if}
  <div class="side-by-side">
    <InputText type="email" label="Email" bind:value={email} />
    <InputText type="tel" label="Numéro de téléphone" bind:value={phone} />
  </div>
  <InputDate
    actionIcon={IconClear}
    on:action={() => {
      // eslint-disable-next-line unicorn/no-null
      birthday = null;
    }}
    label="Date de naissance"
    bind:value={birthday}
  />
  <InputText label="Adresse postale" bind:value={address} />
  <section class="submit">
    <ButtonSecondary submits {loading}>Sauvegarder</ButtonSecondary>
  </section>
</form>

<style>
  form {
    display: flex;
    flex-flow: column wrap;
    gap: 0.5rem;
  }

  .side-by-side {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .submit {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }
</style>
