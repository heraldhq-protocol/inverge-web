/**
 * The dashboard greeting.
 *
 * Pure and hour-based so the server can compute it once. A component that
 * called `new Date()` during render would disagree with hydration, and the
 * viewer's timezone is not stored yet, so the page simply omits a timezone
 * claim and greets from the server clock.
 */
export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function greetingFor(now: Date): string {
  return greetingForHour(now.getHours());
}
