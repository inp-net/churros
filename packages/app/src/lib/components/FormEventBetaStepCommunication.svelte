<script lang="ts">
  import FormPicture from './FormPicture.svelte';
  import InputLinks from './InputLinks.svelte';
  import InputLongText from './InputLongText.svelte';

  export let description: string;
  export let pictureFile: string;
  export let eventUid: string;
  export let eventId: string;
  export let links: Array<{ name: string; value: string }>;

  let pictureObject = {
    id: eventId,
    uid: eventUid,
    pictureFile,
  };

  $: pictureFile = pictureObject.pictureFile;
</script>

<section class="data">
  <InputLinks label="Liens" bind:value={links}></InputLinks>
  <InputLongText rich label="Description" bind:value={description}></InputLongText>
</section>
<section class="thumbnail">
  <h2>Miniature</h2>
  <FormPicture bind:object={pictureObject} objectName="Event"></FormPicture>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 600px;
  }

  section.thumbnail {
    margin-top: 2rem;
  }
</style>
