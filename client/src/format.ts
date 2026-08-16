/**
 * Currency formatting for the whole app.
 *
 * The locale — not the currency code — decides separators and symbol placement.
 * `currency: 'EUR'` alone would render "10.000,00 €" under de-DE and
 * "10 000,00 €" under fr-FR. 'en-IE' is pinned deliberately for the
 * "€10,000.00" style (comma thousands, dot decimal).
 *
 * It is pinned rather than left to the viewer's browser locale so the app looks
 * the same on every device it is opened from, including the mini-PC.
 *
 * Formatters are built once here: constructing an Intl.NumberFormat is
 * comparatively expensive and must not happen per row inside a render.
 */
const LOCALE = 'en-IE';
const CURRENCY = 'EUR';

const euro = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
});

const euroSigned = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  signDisplay: 'always',
});

/** "€10,000.00" — negatives render as "-€45.00". */
export function formatEuro(amount: number): string {
  return euro.format(amount);
}

/**
 * "+€10,000.00" / "-€45.00" — always shows the sign, for transaction rows where
 * deposit-vs-withdrawal is the point.
 */
export function formatEuroSigned(amount: number): string {
  return euroSigned.format(amount);
}
