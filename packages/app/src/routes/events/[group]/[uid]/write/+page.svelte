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
  <h1><ButtonBack /> Écrire un post sur {data.event.title}</h1>
  <FormArticle afterGoTo={() => '..'} hideEvent bind:data={articleData} />
</div>

<style>
  .content {
    max-width: 600px;
    padding: 0 1rem;
    margin: 0 auto;
  }

  h1 {
    display: flex;
    align-items: center;
    margin: 1rem 0;
  }
</style>
