<script lang="ts">
  import debounce from 'lodash.debounce';
  import InputText from './InputText.svelte';
  import { route } from '$lib/ROUTES';

  export let optional = false;
  export let value: string;
  export let label: string;
  export let hint =
    'Composé de lettres, chiffres, - et _. Choisis-le bien, tu ne pourras pas le modifier par la suite ;)';
  export let errors: string[] | undefined = undefined;
  let uidAvailabilityErrors: string[] = [];
  export let unavailable: boolean = false;
  $: unavailable = uidAvailabilityErrors.length > 0;

  async function runUidCheck(uid: string) {
    uidIsAvailable = null;
    try {
      ({ available: uidIsAvailable, errors: uidAvailabilityErrors } = await fetch(
        route('GET /check-uid/[uid]', uid),
      ).then(async (r) => {
        if (r.status !== 200) throw new Error('Failed to check uid availability');
        return r.json();
      }));

      if (!uidIsAvailable && uidAvailabilityErrors.length === 0)
        uidAvailabilityErrors = [`@${uid} est indisponible.`];
    } catch {
      uidAvailabilityErrors = [
        'Impossible de vérifier la disponibilité de cet @. Réessaye plus tard.',
      ];
      uidIsAvailable = false;
    }
  }

  let uidIsAvailable: boolean | null = false;
  const debouncedCheckUid = debounce(runUidCheck, 500);
  $: {
    uidIsAvailable = null;
    uidAvailabilityErrors = [];
    if (value.length < 3 || value.length > 255 || !/^[\w-]{3,255}$/.test(value)) {
      if (value && (errors ?? []).length === 0) {
        uidIsAvailable = false;
        uidAvailabilityErrors = [`@${value} est invalide`];
      } else {
        uidAvailabilityErrors = [];
      }
    } else {
      debouncedCheckUid(value);
    }
  }
</script>

<InputText
  hint={value && uidIsAvailable === null ? 'Vérification' : uidIsAvailable ? 'Disponible' : hint}
  hintStyle={value && uidIsAvailable === null ? 'loading' : uidIsAvailable ? 'success' : 'muted'}
  {label}
  pattern="^[\w_\-]+$"
  minlength={3}
  maxlength={255}
  required={!optional}
  errors={[...(errors ?? []), ...(uidAvailabilityErrors ?? [])]}
  {...$$restProps}
  bind:value
></InputText>
