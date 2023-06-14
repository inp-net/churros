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
