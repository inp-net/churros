<script lang="ts">
  import { goto } from '$app/navigation';
  import Alert from '$lib/components/alerts/Alert.svelte';
  import Button from '$lib/components/buttons/Button.svelte';
  import FormInput from '$lib/components/inputs/FormInput.svelte';
  import { GraphQLError, GroupType, zeus, ZeusError } from '$lib/zeus';
  import ClubDetails from '$lib/../routes/club/[group]/edit/ClubDetails.svelte';
  import type { PageData } from './$types';
  import ParentSearch from './ParentSearch.svelte';
  import ClubPicture from '$lib/../routes/club/[group]/edit/ClubPicture.svelte';
  import { onMount } from 'svelte';

  export let data: PageData;
</script>

<h1>Création d'un groupe</h1>

<!-- <ClubPicture bind:club={data.group} /> -->
<ClubDetails bind:data />

<style lang="scss">
  input,
  select {
    display: block;
    width: 100%;
  }

  .oneline {
    input {
      display: inline-block;
      width: unset;
    }
  }
</style>
