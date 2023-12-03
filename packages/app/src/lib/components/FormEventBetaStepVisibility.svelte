<script lang="ts">
  import type { Visibility } from '$lib/zeus';
  import FormEventBetaPreviewCard from './FormEventBetaPreviewCard.svelte';
  import InputVisibility from './InputVisibility.svelte';

  export let visibility: Visibility;

  export let title: string;
  export let description: string;
  export let group: {
    id: string;
    uid: string;
    name: string;
    pictureFile: string;
    pictureFileDark: string;
  };
  export let pictureFile: string;
  export let uid: string;
  export let links: Array<{ name: string; value: string }>;
  export let coOrganizers: Array<{
    id: string;
    uid: string;
    name: string;
    pictureFile: string;
    pictureFileDark: string;
  }>;
</script>

<section class="inputs">
  <InputVisibility bind:value={visibility}></InputVisibility>
</section>
<section class="preview">
  <FormEventBetaPreviewCard
    {...{ title, description, group, pictureFile, uid, links, coOrganizers }}
  />
</section>
