<script lang="ts">
  import { Selector, zeus } from '$lib/zeus';
  import InputText from './InputText.svelte';
  import IconClear from '~icons/mdi/clear';
  import InputDate from './InputDate.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import InputLongText from './InputLongText.svelte';
  import { me } from '$lib/session';
  import InputSearchObjectList from './InputSearchObjectList.svelte';
  import InputSearchObject from './InputSearchObject.svelte';
  import Fuse from 'fuse.js';
  import InputField from './InputField.svelte';
  import InputNumber from './InputNumber.svelte';
  import InputEmailList from './InputEmailList.svelte';
  import { createEventDispatcher } from 'svelte';
  import InputSocialLinks from './InputSocialLinks.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import { yearTier } from '$lib/dates';
  import { toasts } from '$lib/toasts';
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
      address: string;
      description: string;
      graduationYear: number;
      minor?: {
        id: string;
        name: string;
        yearTier: number;
        shortName: string;
      };
      major: {
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
      phone: string;
      firstName: string;
      lastName: string;
      email: string;
      otherEmails: string[];
      birthday: Date | null;
      uid: string;
      apprentice: boolean;
      contributesWith: Array<{ id: string; name: string }>;
      cededImageRightsToTVn7: boolean;
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
      // eslint-disable-next-line unicorn/no-null
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

  $: canEditContributions = Boolean($me?.canEditUsers);

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
            links: links.filter((l) => Boolean(l.value) && l.value.trim() !== '#'),
            address,
            graduationYear,
            majorId: major.id,
            // eslint-disable-next-line unicorn/no-null
            minorId: minor?.id ?? null,
            phone,
            apprentice,
            birthday,
            otherEmails,
            email,
            contributesWith: canEditContributions ? contributesWith.map((c) => c.id) : undefined,
            cededImageRightsToTVn7,
          },
          {
            __typename: true,
            '...on Error': { message: true },
            '...on MutationUpdateUserSuccess': { data: userQuery },
          },
        ],
      });

      if (updateUser.__typename === 'Error') {
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
      hint={$me?.canEditUsers ? '' : "Pour modifier votre nom d'usage, contactez un administrateur"}
      disabled={!$me?.canEditUsers || undefined}
    />
    <InputText
      required
      label="Nom de famille"
      maxlength={255}
      bind:value={lastName}
      disabled={!$me?.canEditUsers || undefined}
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
      <InputField required label="Filière">
        <InputSearchObject
          required
          value={major.id}
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
  <InputField label="Parcours">
    <InputSearchObject
      hint="Si tu ne trouves pas ton parcours, vérifies ta filière et ta promo"
      clearable
      value={minor?.id}
      valueKey="id"
      labelKey="name"
      bind:object={minor}
      search={(query) =>
        new Fuse(
          major.minors.filter((m) => m.yearTier === yearTier(graduationYear)),
          {
            keys: ['name', 'id', 'shortName'],
          },
        )
          .search(query)
          .map((r) => r.item)}
    >
      <span slot="item" let:item
        >{item.shortName || item.name}
        {#if item.shortName && item.shortName !== item.name}({item.name}){/if}</span
      >
    </InputSearchObject>
  </InputField>
  <div class="side-by-side">
    <InputText
      type="email"
      label="Email principale"
      hint="Celle que tu utilises pour te connecter"
      maxlength={255}
      bind:value={email}
    />
    <InputText type="tel" label="Numéro de téléphone" maxlength={255} bind:value={phone} />
  </div>
  <InputSocialLinks bind:value={links} label="Réseaux sociaux" />
  <InputEmailList placeholder="moi@example.com" label="Autres emails" bind:value={otherEmails} />
  <InputDate
    actionIcon={IconClear}
    on:action={() => {
      // eslint-disable-next-line unicorn/no-null
      birthday = null;
    }}
    label="Date de naissance"
    bind:value={birthday}
  />
  <InputText label="Adresse postale" maxlength={255} bind:value={address} />
  {#if canEditContributions}
    <InputCheckbox bind:value={cededImageRightsToTVn7} label="Je cède mon droit à l'image à TVn7" />
    <p class="typo-details">
      Cela revient à remplir et signer <a href="/cessation-droit-image-tvn7.pdf">ce document</a>
    </p>
  {/if}
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
    align-items: flex-end;
  }

  .submit {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }
</style>
