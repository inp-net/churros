<script lang="ts">
  import InputText from '$lib/components/InputText.svelte';
  import IconShow from '~icons/msl/visibility-outline';
  import IconHide from '~icons/msl/visibility-off-outline';

  export let label: string;
  export let value: string;
  export let hint = '8 caractères minimum';

  // TODO: zxcvbn

  export let shown = false;
</script>

<InputText
  {label}
  {...$$restProps}
  type={shown ? 'text' : 'password'}
  bind:value
  minlength={8}
  {hint}
  actionIcon={shown ? IconHide : IconShow}
  on:action={() => {
    shown = !shown;
  }}
/>
