<script lang="ts">
  import Groups from '$lib/components/CarouselGroups.svelte';

  const groups = [
    { name: 'Ski', pictureFile: 'groups/ski.jpg', uid: 'ski' },
    { name: 'Cinéma', pictureFile: 'groups/cinema.jpg', uid: 'cinema' },
    { name: 'Pétanque', pictureFile: 'groups/petanque.jpg', uid: 'petanque' },
    { name: 'Vélo', pictureFile: 'groups/velo.jpg', uid: 'velo' },
    { name: 'Ski2', pictureFile: 'groups/ski.jpg', uid: 'ski' },
    { name: 'Cinéma2', pictureFile: 'groups/cinema.jpg', uid: 'cinema' },
    { name: 'Pétanque2', pictureFile: 'groups/petanque.jpg', uid: 'petanque' },
    { name: 'Vélo2', pictureFile: 'groups/velo.jpg', uid: 'velo' },
    { name: 'Ski3', pictureFile: 'groups/ski.jpg', uid: 'ski' },
    { name: 'Cinéma3', pictureFile: 'groups/cinema.jpg', uid: 'cinema' },
    { name: 'Pétanque3', pictureFile: 'groups/petanque.jpg', uid: 'petanque' },
    { name: 'Vélo3', pictureFile: 'groups/velo.jpg', uid: 'velo' },
  ];
</script>

<Groups {groups} />
