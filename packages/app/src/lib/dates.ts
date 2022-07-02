export const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const formatDate = (date: unknown) => dateFormatter.format(date as Date);
