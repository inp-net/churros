<script lang="ts">
  import { zeus } from '$lib/zeus';
  // FIXME don't use this
  import { _userQuery as userQuery } from '../../routes/user/[uid]/edit/+page';
  import InputText from './InputText.svelte';
  import InputField from './InputField.svelte';
  import IconClear from '~icons/mdi/clear';
  import InputDate from './InputDate.svelte';

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
      location: string;
      birthday: Date | null;
      uid: string;
    };
  };

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
      location,
      lastName,
      email,
      // See https://github.com/graphql-editor/graphql-zeus/issues/262
      // eslint-disable-next-line unicorn/no-null
      birthday = null,
    },
  } = data;

  const valueAsDate = (x: unknown) => (x as HTMLInputElement).valueAsDate;

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

      data.user = updateUser.data;
    } finally {
      loading = false;
    }
  };
</script>

<form on:submit|preventDefault={updateUser}>
  <div class="side-by-side">
    <InputText required label="Prénom" bind:value={firstName} />
    <InputText required label="Nom de famille" bind:value={lastName} />
  </div>
  <!--TODO input rich text  -->
  <InputField label="Description"
    ><textarea bind:value={description} cols="30" rows="10" /></InputField
  >
  <!-- TODO input person -->
  <!-- TODO backend for this <InputText label="Parrain (identifiant)"></InputText> -->
  <InputText type="email" label="Email" bind:value={email} />
  <InputText label="Surnom" bind:value={nickname} />
  <InputText type="tel" label="Numéro de téléphone" bind:value={phone} />
  <InputDate
    actionIcon={IconClear}
    on:action={() => {
      // eslint-disable-next-line unicorn/no-null
      birthday = null;
    }}
    label="Date de naissance"
    bind:value={birthday}
  />
  <InputText label="Adresse postale" bind:value={location} />
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
</style>
