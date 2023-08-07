<script lang="ts">
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import FormArticle from '$lib/components/FormArticle.svelte';
  import { me } from '$lib/session';
  import type { PageData } from './$types';

  export let data: PageData;

  let articleData = {
    article: {
      uid: '',
      id: '',
      group: data.group,
      author: $me,
      visibility: data.event.visibility,
      title: '',
      body: '',
      pictureFile: '',
      links: [],
      publishedAt: new Date(),
      eventId: data.event.id,
      event: data.event,
    },
  };
</script>

<div class="content">
  <h1><ButtonBack /> Écrire un article sur {data.event.title}</h1>
  <FormArticle hideEvent bind:data={articleData} />
</div>

<style>
  .content {
    max-width: 600px;
    margin: 0 auto;
  }
</style>
