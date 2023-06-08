<script lang="ts">
  import type { PageData } from './$types';
  import ClubDetails from './ClubDetails.svelte';
  import ClubPicture from './ClubPicture.svelte';

  export let data: PageData;

  $: ({ group } = data);
</script>

<h1>Éditer <a href="..">{group.name}</a></h1>

<a href="../members">Modifier les membres</a>

<ClubPicture club={group} />
<ClubDetails bind:data />
