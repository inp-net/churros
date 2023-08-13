import { isMonday, previousMonday } from 'date-fns';

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
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

export function schoolYearStart(): Date {
  const now = new Date();
  const thisYearSeptemberFirst = new Date(now.getFullYear(), 9, 1);
  if (now > thisYearSeptemberFirst) return thisYearSeptemberFirst;

  return new Date(now.getFullYear() - 1, 9, 1);
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
