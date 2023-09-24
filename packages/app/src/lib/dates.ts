import { format, isMonday, isSameDay, previousMonday } from 'date-fns';
import fr from 'date-fns/locale/fr/index.js';
import { EventFrequency } from '$lib/zeus';

export const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
});

export const formatDateTime = (date: unknown) => dateTimeFormatter.format(new Date(date as Date));
export const formatDate = (date: unknown) => dateFormatter.format(new Date(date as Date));

export const formatDatetimeLocal = (date: Date | string) => {
  if (typeof date === 'string') date = new Date(Date.parse(date));

  const pad = (number: number) => {
    if (number < 10) return `0${number.toString()}`;
    return number.toString();
  };

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

export function schoolYearStart(): Date {
  const now = new Date();
  const thisYearSeptemberFirst = new Date(now.getFullYear(), 8, 1);
  if (now > thisYearSeptemberFirst) return thisYearSeptemberFirst;

  return new Date(now.getFullYear() - 1, 8, 1);
}

export function yearTier(graduationYear: number): number {
  return schoolYearStart().getFullYear() - graduationYear + 4;
}

export function fromYearTier(tier: number): number {
  return schoolYearStart().getFullYear() - tier + 4;
}

export function yearRangeUpTo(end: number, length: number): number[] {
  const result = [];

  for (let i = end - length; i < end; i++) result.push(i);

  return result;
}

export function closestMonday(date: Date): Date {
  if (isMonday(date)) return date;
  return previousMonday(date);
}

export function formatEventDates(
  frequency: EventFrequency,
  startsAt: Date,
  endsAt: Date,
  recurringUntil: Date | undefined,
): string {
  switch (frequency) {
    case EventFrequency.Once: {
      if (isSameDay(startsAt, endsAt)) {
        return `${formatDate(startsAt)}, de ${format(startsAt, 'HH:mm')} à ${format(
          endsAt,
          'HH:mm',
        )}`;
      }

      return `${formatDateTime(startsAt)} — ${formatDateTime(endsAt)}`;
    }

    default: {
      if (recurringUntil) return `Du ${formatDate(startsAt)} au ${formatDate(recurringUntil)}`;
      return `À partir du ${formatDate(startsAt)}`;
    }
  }
}

export function formatRecurrence(frequency: EventFrequency, startsAt: Date, endsAt: Date): string {
  switch (frequency) {
    case EventFrequency.Biweekly: {
      return `Toutes les deux semaines de ${format(startsAt, 'HH:mm')} à ${format(
        endsAt,
        'HH:mm',
      )}`;
    }

    case EventFrequency.Monthly: {
      return `Tout les mois le ${format(startsAt, 'DD')}, de ${format(
        startsAt,
        'HH:mm',
      )} à ${format(endsAt, 'HH:mm')}`;
    }

    case EventFrequency.Weekly: {
      return `Chaque ${format(startsAt, 'EEEE', { locale: fr })} de ${format(
        startsAt,
        'HH:mm',
      )} à ${format(endsAt, 'HH:mm')}`;
    }

    default: {
      return '';
    }
  }
}

export function parseYearTier(yearTierDisplay: string): number {
  return Number.parseInt(yearTierDisplay.replace(/a$/, ''), 10);
}
