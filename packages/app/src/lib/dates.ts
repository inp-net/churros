export const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
});

export const formatDateTime = (date: unknown) => dateTimeFormatter.format(date as Date);
export const formatDate = (date: unknown) => dateFormatter.format(date as Date);
