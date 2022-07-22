<script context="module" lang="ts">
  import type { Load } from './__types';

  export const load: Load = () => {
    const now = new Date();
    return {
      status: 307,
      redirect: `${now.getFullYear()}/${`${now.getMonth() + 1}`.padStart(2, '0')}/`,
    };
  };
</script>
