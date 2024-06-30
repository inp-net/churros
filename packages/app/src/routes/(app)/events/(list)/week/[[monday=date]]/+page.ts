import { graphql, load_PageEventsWeek } from '$houdini';
import { addWeeks, formatISO, nextMonday, startOfWeek } from 'date-fns';

graphql(`
  query PageEventsWeek($monday: String!, $nextMonday: String) {
    ...ListEventsByDay @with(after: $monday, before: $nextMonday) @loading
  }
`);

export async function load(event) {
  const variables = event.params.monday
    ? {
        monday: event.params.monday,
        nextMonday: formatISO(addWeeks(new Date(event.params.monday), 1), {
          representation: 'date',
        }),
      }
    : {
        monday: formatISO(startOfWeek(new Date()), { representation: 'date' }),
        nextMonday: formatISO(nextMonday(new Date()), { representation: 'date' }),
      };

  return load_PageEventsWeek({ event, variables });
}
