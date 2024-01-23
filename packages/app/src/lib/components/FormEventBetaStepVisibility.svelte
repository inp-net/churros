<script lang="ts">
  import type { Visibility } from '$lib/zeus';
  import InputVisibilityRadios from './InputVisibilityRadios.svelte';

  export let visibility: Visibility;
</script>

<section class="inputs">
  <InputVisibilityRadios label="Qui peut voir l'évènement?" bind:visibility />
</section>
