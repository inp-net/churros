<script lang="ts">
  import { fragment, graphql } from '$houdini';

  export let booking;
  $: _data = fragment(
    booking,
    graphql(`
      fragment ModalCurrentBookingStep on Registration @loading {
        paymentMethod
        ticket {
          price
          allowedPaymentMethods
        }
      }
    `),
  );
</script>
