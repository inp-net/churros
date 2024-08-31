import { graphql } from '$houdini';
import { operationErrorMessages, operationSucceeded } from '$lib/errors';
import { route } from '$lib/ROUTES.js';
import { error, text } from '@sveltejs/kit';

const BookingsExport = graphql(`
  query BookingCSVExport($id: LocalID!, $ticketPageURLTemplate: URL!) {
    event(id: $id) {
      bookingsCsv(dialect: Excel, bookingURL: $ticketPageURLTemplate) {
        ... on EventBookingsCsvSuccess {
          data
        }
        ...MutationErrors @mask_disable
      }
    }
  }
`);

export async function GET(event) {
  const result = await BookingsExport.fetch({
    event,
    variables: {
      id: event.params.id,
      ticketPageURLTemplate: new URL(route('/bookings/[code]', '[code]'), event.url),
    },
  });
  if (operationSucceeded(result, result.data?.event.bookingsCsv)) {
    return text(result.data.event.bookingsCsv.data, {
      headers: {
        'Content-Disposition': `attachment; filename="bookings-${event.params.id}.csv"`,
        'Content-Type': 'text/csv',
      },
    });
  } else {
    error(500, {
      message: operationErrorMessages(result, result.data?.event.bookingsCsv).join(', '),
    });
  }
}
