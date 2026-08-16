import { types } from 'pg';

/**
 * node-postgres parses date/timestamp columns into JS `Date` objects by default.
 * Every date field in our GraphQL schema is declared `String!`, and graphql-js
 * serialises a `Date` by calling `valueOf()` — which yields epoch milliseconds.
 * The API therefore returned `"1786572000000"` instead of `"2026-08-13"`.
 *
 * Parsing these to strings at the driver boundary fixes it in one place, rather
 * than formatting at ~22 separate resolver mapping sites where a single missed
 * one silently regresses.
 *
 * DATE is deliberately returned verbatim. Converting via `Date` would place the
 * value at local midnight, and `.toISOString()` on that shifts the calendar day
 * backwards for any timezone east of UTC — an off-by-one-day bug on occurredOn.
 */
const DATE_OID = 1082;
const TIMESTAMPTZ_OID = 1184;

let installed = false;

export function installDateTypeParsers(): void {
  if (installed) return;
  installed = true;

  // Postgres text format is already 'YYYY-MM-DD'.
  types.setTypeParser(DATE_OID, (value: string) => value);

  // Postgres text format is '2026-08-13 14:37:48.123+02' — valid input to Date,
  // but not ISO-8601. Normalise so clients get a parseable timestamp.
  types.setTypeParser(TIMESTAMPTZ_OID, (value: string) => new Date(value).toISOString());
}
