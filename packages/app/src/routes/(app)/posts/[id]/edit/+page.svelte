<script lang="ts">
  import { afterNavigate, replaceState } from '$app/navigation';
  import { page } from '$app/stores';
  import { route } from '$lib/ROUTES';

  afterNavigate(() => {
    replaceState(route('/posts/[id]/edit/body', $page.params.id), {});
  });
</script>
