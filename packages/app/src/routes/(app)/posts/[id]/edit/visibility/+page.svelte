<script lang="ts">
  import { page } from '$app/stores';
  import { NotificationsSendCountForPostStore, type Visibility$options } from '$houdini';
  import { track } from '$lib/analytics';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import InputRadios from '$lib/components/InputRadios.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import { formatDateTimeSmart } from '$lib/dates';
  import { DISPLAY_VISIBILITIES, HELP_VISIBILITY } from '$lib/display';
  import { loaded, LoadingSpinner, LoadingText, mapLoading } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import IconCheck from '~icons/msl/check';
  import IconClose from '~icons/msl/close';
  import IconSend from '~icons/msl/send-outline';
  import { ChangePostVisibility } from '../mutations';
  import type { PageData } from './$houdini';
  import { isToday } from 'date-fns';

  export let data: PageData;
  $: ({ PagePostEditVisibility } = data);

  let visibility: Visibility$options;
  $: if ($PagePostEditVisibility.data && loaded($PagePostEditVisibility.data.post.visibility))
    visibility ??= $PagePostEditVisibility.data?.post.visibility;

  let NotificationsSendCount = new NotificationsSendCountForPostStore();

  let openModalWarnNotifications: () => void;

  function willIncreasePublicity(current: Visibility$options, visibility: Visibility$options) {
    if (current === 'Public') return false;
    if (current === 'SchoolRestricted') return visibility === 'Public';
    if (current === 'GroupRestricted') return ['Public', 'SchoolRestricted'].includes(visibility);
    return ['Public', 'SchoolRestricted', 'GroupRestricted'].includes(visibility);
  }
</script>

<MaybeError result={$PagePostEditVisibility} let:data={{ post }}>
  <ModalOrDrawer bind:open={openModalWarnNotifications} let:close>
    <div class="modal-content">
      <h1>Sûr·e de toi?</h1>
      <p>
        Tu t'apprêtes à envoyer une notification à <strong
          >plus de
          <span class="notified-count">
            {#if !loaded($NotificationsSendCount.data?.notificationsSendCountForArticle)}
              <LoadingSpinner></LoadingSpinner>
            {:else}
              {$NotificationsSendCount.data?.notificationsSendCountForArticle}
            {/if}
          </span>
          personnes</strong
        >. Utilise plutôt la visibilité
        {DISPLAY_VISIBILITIES.GroupRestricted} si ça te paraît trop.
      </p>
      <div class="actions">
        <ButtonSecondary track="post-visibility-warning-backoff" icon={IconClose} on:click={close}
          >Annuler</ButtonSecondary
        >
        <ButtonSecondary
          track="post-visibility-warning-confirm"
          icon={IconSend}
          on:click={async () => {
            await mutateAndToast(ChangePostVisibility, {
              post: $page.params.id,
              visibility: visibility,
            });
            close?.();
          }}>Publier</ButtonSecondary
        >
      </div>
    </div>
  </ModalOrDrawer>

  <div class="contents">
    <InputField label="Visibilité">
      <InputRadios bind:value={visibility} options={DISPLAY_VISIBILITIES}>
        <div slot="label" class="visibility-label label" let:label let:option>
          <p class="main">{label}</p>
          <p class="muted">{HELP_VISIBILITY[option]}</p>
        </div>
      </InputRadios>
    </InputField>

    <ButtonPrimary
      on:click={async () => {
        if (!loaded(post.visibility)) return;
        if (!loaded(post.group.uid)) return;
        if (
          ['SchoolRestricted', 'Public'].includes(visibility) &&
          willIncreasePublicity(post.visibility, visibility)
        ) {
          openModalWarnNotifications();
          await NotificationsSendCount.fetch({
            variables: {
              group: post.group.uid,
              visibility,
            },
          });
          track('post-visibiliy-warning-shown', { visibility });
        } else {
          await mutateAndToast(ChangePostVisibility, {
            post: $page.params.id,
            visibility: visibility,
          });
        }
      }}
      disabled={post.visibility === visibility}
    >
      {#if loaded(post.visibility) && willIncreasePublicity(post.visibility, visibility)}
        Publier
      {:else}
        Enregistrer
      {/if}
    </ButtonPrimary>

    {#if post.notifiedAt}
      <p class="muted notifications">
        <LoadingText value={mapLoading(post.notifiedAt, formatDateTimeSmart)} />
        <span class="success">
          <IconCheck />
        </span>
        Notifications envoyées
      </p>
    {/if}
  </div>
</MaybeError>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    row-gap: 2rem;
    padding: 0 1rem;

    --radio-size: 1.5rem;
    --weight-field-label: 800;
  }

  .label {
    line-height: 1.1;
  }

  .label .muted {
    margin-top: 0.2em;
    font-size: 0.8rem;
  }

  .notifications {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5em;
    line-height: 1;
  }

  .notifications .success {
    font-size: 1.2em;
  }
</style>
