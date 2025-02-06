<script lang="ts">
  import { goto } from '$app/navigation';
  import { graphql } from '$houdini';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import InputMajor from '$lib/components/InputMajor.svelte';
  import InputNumber from '$lib/components/InputNumber.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { allLoaded } from '$lib/loading';
  import { isMobile } from '$lib/mobile';
  import { mutateAndToast } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
  import IconSave from '~icons/msl/check-circle-outline';
  import ModalRefuseReason from '../../ModalRefuseReason.svelte';
  import { IconAccept, IconRefuse } from '../../shared';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageSignupsEdit } = data);

  let args = {
    email: '',
    uid: null,
    birthday: null as Date | null,
    firstName: '',
    graduationYear: null as unknown as number,
    lastName: '',
    major: null as string | null,
    cededImageRightsToTVn7: null,
  };

  $: candidate = $PageSignupsEdit.data?.userCandidateByEmail;
  let dirty = false;
  $: if (candidate && allLoaded(candidate) && !dirty) {
    args = {
      email: candidate.email,
      uid: null,
      birthday: candidate.birthday,
      firstName: candidate.firstName,
      graduationYear: candidate.graduationYear,
      lastName: candidate.lastName,
      major: candidate.major?.uid ?? null,
      cededImageRightsToTVn7: null,
    };
  }

  const Update = graphql(`
    mutation UpdateUserCandidate(
      $register: Boolean!
      $email: Email!
      $input: UserCandidateUpdateInput!
    ) {
      updateUserCandidate(register: $register, email: $email, input: $input) {
        ...MutationErrors
        ... on MutationUpdateUserCandidateSuccess {
          data {
            ...LayoutManageSignups_UserCandidate
          }
        }
      }
    }
  `);

  const mobile = isMobile();

  async function updateUserCandidate({ register = false, quiet = false } = {}) {
    const { email, ...input } = args;
    await mutateAndToast(
      Update,
      { register, email, input },
      quiet
        ? undefined
        : {
            error: "Impossible de mettre à jour l'inscription",
            success: register
              ? `${input.firstName} ${input.lastName} a été inscrit·e`
              : 'Inscription sauvegardée',
          },
    );

    // Always come back on mobile since we don't have both sides of the split at the same time
    if (register || mobile) 
      await goto(route('/signups'));
    
  }

  let openRefusalReason: () => void;
</script>

<ModalRefuseReason bind:open={openRefusalReason} email={candidate?.email ?? ''} />

<MaybeError result={$PageSignupsEdit} let:data>
  {@const { userCandidateByEmail: candidate } = data}
  <div class="contents">
    {#if !allLoaded(candidate)}
      <LoadingScreen />
    {:else}
      <div class="side-by-side">
        <InputText
          on:input={() => {
            dirty = true;
          }}
          initial={candidate.firstName}
          bind:value={args.firstName}
          label="Prénom"
        />
        <InputText
          on:input={() => {
            dirty = true;
          }}
          initial={candidate.lastName}
          bind:value={args.lastName}
          label="Nom de famille"
        />
      </div>
      <div class="curriculum side-by-side">
        <InputField label="Filière & école">
          <InputMajor
            on:pick={() => {
              dirty = true;
            }}
            clearable
            clearLabel="Externe"
            options={data}
            bind:major={args.major}
          />
        </InputField>
        <InputNumber
          on:input={() => {
            dirty = true;
          }}
          label="Promotion"
          initial={candidate.graduationYear}
          bind:value={args.graduationYear}
        ></InputNumber>
      </div>
      <section class="submit">
        <ButtonSecondary
          danger
          icon={IconRefuse}
          help="Appliquer les changements et refuser l'inscription"
          on:click={async () => {
            await updateUserCandidate({ quiet: true });
            openRefusalReason?.();
          }}
        >
          Refuser
        </ButtonSecondary>
        <ButtonSecondary
          icon={IconSave}
          submits
          help="Appliquer les modifications sans inscrire"
          on:click={async () => {
            await updateUserCandidate();
          }}
        >
          Appliquer
        </ButtonSecondary>
        <ButtonSecondary
          success
          help="Inscrire avec les modifications effectuées"
          icon={IconAccept}
          submits
          on:click={async () => {
            await updateUserCandidate({ register: true });
          }}
        >
          Inscrire
        </ButtonSecondary>
      </section>
    {/if}
  </div>
</MaybeError>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 0 1rem;
  }

  .side-by-side {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  .curriculum :global(> :last-child) {
    max-width: 10rem;
    margin: 0 auto;
  }

  .submit {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-top: 3rem;
  }
</style>
