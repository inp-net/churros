<script lang="ts">
  export let pictureFile: string;
  export let title: string;
  export let descriptionHtml: string;
  export let startsAt: Date;
  export let endsAt: Date;
  export let tickets: Array<{ opensAt: Date; endsAt: Date }>;
  export let href: string;
  export let author: { uid: string; pictureFile: string; fullName: string };
</script>

<!-- Votre code HTML et CSS ici -->
