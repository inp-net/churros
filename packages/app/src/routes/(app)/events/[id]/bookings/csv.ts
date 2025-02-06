import { browser } from '$app/environment';
import { page } from '$app/stores';
import { graphql } from '$houdini';
import { formatDateTime } from '$lib/dates';
import { saveStringAsFile } from '$lib/download';
import { operationErrorMessages, operationSucceeded } from '$lib/errors';
import { route } from '$lib/ROUTES';
import { toasts } from '$lib/toasts';
import { get } from 'svelte/store';

export const BookingsExport = graphql(`
  query BookingsCSVExport($id: LocalID!, $ticketPageURLTemplate: URL!) {
    event(id: $id) {
      title
      bookingsCsv(dialect: Excel, bookingURL: $ticketPageURLTemplate) {
        ... on EventBookingsCsvSuccess {
          data
        }
        ...MutationErrors @mask_disable
      }
    }
  }
`);

export async function downloadCsv(eventId: string) {
  if (!browser) return;
  const result = await BookingsExport.fetch({
    variables: {
      id: eventId,
      ticketPageURLTemplate: new URL(route('/bookings/[code]', '[code]'), get(page).url),
    },
  });
  if (operationSucceeded(result, result.data?.event.bookingsCsv)) {
    const { event } = result.data;
    saveStringAsFile(
      `Réservations ${event.title} au ${formatDateTime(new Date()).replaceAll(':', 'h')}`,
      result.data.event.bookingsCsv.data,
      'text/csv',
    );
  } else {
    toasts.error(
      "Impossible d'exporters les réservations",
      operationErrorMessages(result, result.data?.event.bookingsCsv).join(', '),
    );
  }
}
