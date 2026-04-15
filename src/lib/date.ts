export function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
