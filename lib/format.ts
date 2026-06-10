export function formatMatchDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function displayName(profile: { display_name: string | null; email: string }) {
  return profile.display_name?.trim() || profile.email;
}
