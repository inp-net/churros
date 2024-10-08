<script lang="ts">
  import { toasts } from '$lib/toasts';
  import { Selector, zeus } from '$lib/zeus';
  import Fuse from 'fuse.js';
  import { createEventDispatcher } from 'svelte';
  import IconClear from '~icons/mdi/clear';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import InputDate from './InputDate.svelte';
  import InputEmailList from './InputEmailList.svelte';
  import InputField from './InputField.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputNumber from './InputNumber.svelte';
  import InputSearchObject from './InputSearchObject.svelte';
  import InputSearchObjectList from './InputSearchObjectList.svelte';
  import InputSocialLinks from './InputSocialLinks.svelte';
  import InputText from './InputText.svelte';
  const emit = createEventDispatcher();

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
    phone: true,
    birthday: true,
    canBeEdited: true,
    minor: { id: true, name: true, yearTier: true, shortName: true },
    major: {
      id: true,
      name: true,
      shortName: true,
      minors: { id: true, name: true, yearTier: true, shortName: true },
      schools: { id: true, name: true, studentAssociations: { id: true, name: true } },
    },
    email: true,
    otherEmails: true,
    links: { name: true, value: true },
    cededImageRightsToTVn7: true,
    contributesTo: {
      id: true,
      name: true,
    },
  });

  export let data: {
    user: {
      address: string | null;
      description: string;
      graduationYear: number;
      minor: null | {
        id: string;
        name: string;
        yearTier: number;
        shortName: string;
      };
      major: null | {
        name: string;
        shortName: string;
        id: string;
        minors: Array<{ id: string; name: string; yearTier: number; shortName: string }>;
        schools: Array<{
          name: string;
          id: string;
          studentAssociations: Array<{ id: string; name: string }>;
        }>;
      };
      links: Array<{ name: string; value: string }>;
      nickname: string;
      phone: null | string;
      firstName: string;
      lastName: string;
      email: string | null;
      otherEmails: string[] | null;
      birthday: Date | null;
      uid: string;
      apprentice: boolean;
      contributesWith: Array<{ id: string; name: string }>;
      cededImageRightsToTVn7: boolean;
      canBeEdited: boolean;
    };
  };

  export let contributionOptions: Array<{
    id: string;
    name: string;
  }>;

  export let majors: Array<{
    id: string;
    name: string;
    minors: Array<{ id: string; name: string; yearTier: number }>;
  }>;

  // We don't want form bindings to be reactive to let them evolve separately from the data
  let {
    user: {
      address,
      description,
      graduationYear,
      nickname,
      phone,
      firstName,
      lastName,
      email,
      otherEmails,
      apprentice,
      // See https://github.com/graphql-editor/graphql-zeus/issues/262
      birthday = null,
      contributesWith,
      major,
      minor,
      cededImageRightsToTVn7,
    },
  } = data;

  const socialMediaNames = [
    'facebook',
    'instagram',
    'discord',
    'twitter',
    'linkedin',
    'github',
    'hackernews',
    'anilist',
  ] as const;

  let links = socialMediaNames.map((name) => ({
    name,
    value: data.user.links.find((link) => link.name === name)?.value ?? '',
  }));

  $: canEditContributions = Boolean(data.user.canBeEdited);

  let loading = false;
  const updateUser = async () => {
    if (loading) return;
    try {
      loading = true;
      const { updateUser } = await $zeus.mutate({
        updateUser: [
          {
            lastName,
            firstName,
            uid: data.user.uid,
            nickname,
            description,
            address: address ?? '',
            graduationYear,
            majorId: major?.id ?? null,
            minorId: minor?.id ?? null,
            phone: phone ?? '',
            apprentice,
            birthday,
            otherEmails: otherEmails ?? [],
            email: email ?? '',
            contributesWith: canEditContributions ? contributesWith.map((c) => c.id) : undefined,
            cededImageRightsToTVn7,
          },
          {
            '__typename': true,
            '...on Error': { message: true },
            '...on ZodError': { message: true },
            '...on MutationUpdateUserSuccess': { data: userQuery },
          },
        ],
      });

      if (updateUser.__typename !== 'MutationUpdateUserSuccess') {
        toasts.error('Impossible de sauvegarder le profil', updateUser.message);
        return;
      }

      if (updateUser.data.email === email) {
        toasts.success('Profil sauvegardé');
      } else {
        toasts.info(
          `Les changements d'email doivent être validés.`,
          `Regarde ta boîte mail pour ${email}`,
          { lifetime: 10_000 },
        );
      }

      // eslint-disable-next-line unicorn/no-null
      data.user = { ...data.user, ...updateUser.data, birthday: updateUser.data.birthday ?? null };
      emit('save');
    } finally {
      loading = false;
    }
  };
</script>

<form on:submit|preventDefault={updateUser}>
  <div class="side-by-side">
    <InputText
      required
      label="Prénom"
      maxlength={255}
      bind:value={firstName}
      hint={data.user.canBeEdited
        ? ''
        : "Pour modifier votre nom d'usage, contactez un administrateur"}
      disabled={!data.user.canBeEdited || undefined}
    />
    <InputText
      required
      label="Nom de famille"
      maxlength={255}
      bind:value={lastName}
      disabled={!data.user.canBeEdited || undefined}
    />
    <InputText label="Surnom" maxlength={255} bind:value={nickname} />
  </div>
  <InputLongText rich label="Description" bind:value={description} />
  {#if canEditContributions}
    <InputField label="Cotisant à">
      <InputSearchObjectList
        bind:objects={contributesWith}
        values={contributesWith.map(({ id }) => id)}
        labelKey="name"
        valueKey="id"
        search={(query) =>
          new Fuse(contributionOptions, {
            keys: ['name', 'id'],
          })
            .search(query)
            .map((r) => r.item)}
      />
    </InputField>
    <div class="side-by-side">
      <InputField label="Filière">
        <InputSearchObject
          value={major?.id}
          valueKey="id"
          labelKey="name"
          bind:object={major}
          search={(query) =>
            new Fuse(majors, {
              keys: ['name', 'id'],
            })
              .search(query)
              .map((r) => r.item)}
        />
      </InputField>
      <InputNumber label="Promo" bind:value={graduationYear} />
      <InputCheckbox label="Apprenti" bind:value={apprentice} />
    </div>
  {/if}
  {#if major}
    <InputField label="Parcours" hint="Si tu ne trouves pas ton parcours, vérifies ta filière">
      <InputSearchObject
        clearable
        value={minor?.id}
        valueKey="id"
        labelKey="name"
        bind:object={minor}
        search={(query) =>
          new Fuse(major?.minors ?? [], {
            keys: ['name', 'id', 'shortName'],
          })
            .search(query)
            .map((r) => r.item)}
      >
        <span slot="item" let:item
          >{item.shortName || item.name}
          {#if item.shortName && item.shortName !== item.name}({item.name}){/if}</span
        >
      </InputSearchObject>
    </InputField>
  {/if}
  <div class="side-by-side">
    <InputText
      required
      type="email"
      label="Email principale"
      hint="Celle que tu utilises pour te connecter"
      maxlength={255}
      value={email ?? ''}
      on:input={({ detail }) => (email = detail.currentTarget.value || null)}
    />
  </div>
  {#if canEditContributions}
    <InputCheckbox bind:value={cededImageRightsToTVn7} label="Je cède mon droit à l'image à TVn7" />
    <p class="typo-details">
      Cela revient à remplir et signer <a href="/cessation-droit-image-tvn7.pdf">ce document</a>
    </p>
  {/if}
  <h2>Infos du profil</h2>
  <p>
    Ces informations seront visibles par les autres élèves sur ton profil. Elles sont totalement
    facultatives.
  </p>
  <InputSocialLinks bind:value={links} label="Réseaux sociaux" />
  <InputEmailList
    placeholder="moi@example.com"
    label="Autres emails"
    value={otherEmails ?? []}
    on:input={({ detail }) => {
      otherEmails = detail;
    }}
  />
  <InputDate
    actionIcon={IconClear}
    on:action={() => {
      // eslint-disable-next-line unicorn/no-null
      birthday = null;
    }}
    label="Date de naissance"
    bind:value={birthday}
  />
  <InputText
    type="tel"
    label="Numéro de téléphone"
    maxlength={255}
    value={phone ?? ''}
    on:input={({ detail }) => (phone = detail.currentTarget.value || null)}
  />
  <InputText
    label="Adresse postale"
    maxlength={255}
    value={address ?? ''}
    on:input={({ detail }) => (address = detail.currentTarget.value || null)}
  />
  <section class="submit">
    <ButtonPrimary submits {loading}>Sauvegarder</ButtonPrimary>
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
    align-items: flex-end;
  }

  .submit {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }
</style>
