<script lang="ts">
  import FormPicture from './FormPicture.svelte';
  import InputLinks from './InputLinks.svelte';
  import InputLongText from './InputLongText.svelte';

  export let description: string;
  export let pictureFile: string;
  export let uid: string;
  export let links: Array<{ name: string; value: string }>;
</script>

<InputLinks label="Liens" bind:value={links}></InputLinks>
<InputLongText rich label="Description" bind:value={description}></InputLongText>
<section class="thumbnail">
  <h2>Miniature</h2>
  <FormPicture
    object={{
      id: 'event',
      uid,
      pictureFile,
    }}
    objectName="Event"
  ></FormPicture>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
  }
</style>
