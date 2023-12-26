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
  uid: string;
  group: { uid: string };
  frequency: EventFrequency;
  recurringUntil?: Date | undefined;
}): { google: string; ical: string } {
  const calendarEvent: CalendarEvent = {
    title: event.title,
    start: formatISO(event.startsAt),
    end: formatISO(event.endsAt),
    // XXX HARDCODED FRONTEND_ORIGIN since it's a private env var (should be public)
    description:
      event.descriptionHtml +
      `\n\n<a href="https://churros.inpt.fr/events/${event.group.uid}/${event.uid}">Plus d'infos sur Churros</a>`,
    location: event.location,
    // XXX HARDCODED FRONTEND_ORIGIN since it's a private env var (should be public)
    url: `https://churros.inpt.fr/events/${event.group.uid}/${event.uid}`,
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
