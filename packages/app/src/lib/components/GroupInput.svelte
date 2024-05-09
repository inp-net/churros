<script lang="ts">
  export let legend: string = '';
</script>

<fieldset>
  <legend>
    <slot name="legend">
      {legend}
    </slot>
  </legend>

  <slot />
</fieldset>
