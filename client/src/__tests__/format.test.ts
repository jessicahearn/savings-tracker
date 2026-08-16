import { describe, it, expect } from 'vitest';
import { formatEuro, formatEuroSigned } from '../format';

/**
 * These pin the locale as much as the formatting. The euro symbol alone does not
 * determine layout — de-DE would render "10.000,00 €" for the same input — so a
 * change to LOCALE in format.ts should fail here rather than silently reshape
 * every figure in the app.
 */
describe('formatEuro', () => {
  it('groups thousands with commas and uses a dot decimal', () => {
    expect(formatEuro(10000)).toBe('€10,000.00');
  });

  it('groups every three digits on larger numbers', () => {
    expect(formatEuro(1234567.89)).toBe('€1,234,567.89');
  });

  it('always shows two decimal places', () => {
    expect(formatEuro(5)).toBe('€5.00');
    expect(formatEuro(0.5)).toBe('€0.50');
  });

  it('rounds to the nearest cent', () => {
    expect(formatEuro(1234567.891)).toBe('€1,234,567.89');
    expect(formatEuro(0.005)).toBe('€0.01');
  });

  it('places the minus sign before the symbol', () => {
    expect(formatEuro(-45)).toBe('-€45.00');
  });

  it('formats zero', () => {
    expect(formatEuro(0)).toBe('€0.00');
  });
});

describe('formatEuroSigned', () => {
  it('shows an explicit plus for deposits', () => {
    expect(formatEuroSigned(10000)).toBe('+€10,000.00');
  });

  it('shows a minus for withdrawals', () => {
    expect(formatEuroSigned(-45)).toBe('-€45.00');
  });

  it('groups thousands the same way', () => {
    expect(formatEuroSigned(-1234567.89)).toBe('-€1,234,567.89');
  });
});
