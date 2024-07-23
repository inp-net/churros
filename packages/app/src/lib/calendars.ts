import { env } from '$env/dynamic/public';
import type { EventFrequency$options } from '$houdini';
import { route } from '$lib/ROUTES';
import { google, ics, type CalendarEvent } from 'calendar-link';
import { formatISO } from 'date-fns';
import { EventFrequency } from '../zeus';

export function calendarLinks(event: {
  title: string;
  descriptionHtml: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
  location: string;
  localID: string;
  frequency: EventFrequency | EventFrequency$options;
  recurringUntil?: Date | undefined;
}): { google: string; ical: string } {
  const eventURL = new URL(
    route('/events/[id]', event.localID),
    env.PUBLIC_FRONTEND_ORIGIN,
  ).toString();
  const calendarEvent: CalendarEvent = {
    title: event.title,
    start: formatISO(event.startsAt),
    end: formatISO(event.endsAt),
    description: event.descriptionHtml + `\n\n<a href="${eventURL}">Plus d'infos sur Churros</a>`,
    location: event.location,
    url: eventURL,
  };

  if (event.frequency !== EventFrequency.Once) {
    calendarEvent.rRule = `FREQ=${
      {
        [EventFrequency.Biweekly]: 'WEEKLY;INTERVAL=2',
        [EventFrequency.Monthly]: 'MONTHLY',
        [EventFrequency.Weekly]: 'WEEKLY',
      }[event.frequency]
    }`;
  }

  return {
    google: google(calendarEvent),
    ical: ics(calendarEvent),
  };
}
