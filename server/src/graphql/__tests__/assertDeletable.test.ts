import { describe, it, expect } from 'vitest';
import { GraphQLError } from 'graphql';
import { assertDeletable } from '../assertDeletable.js';

function messageFor(blockers: Parameters<typeof assertDeletable>[1]): string {
  try {
    assertDeletable('person', blockers);
    return '(did not throw)';
  } catch (err) {
    return (err as GraphQLError).message;
  }
}

describe('assertDeletable', () => {
  it('returns quietly when nothing references the entity', () => {
    expect(() =>
      assertDeletable('person', [
        { count: 0, noun: 'transaction' },
        { count: 0, noun: 'account' },
      ])
    ).not.toThrow();
  });

  it('throws a CONFLICT so the client can distinguish it from a server error', () => {
    try {
      assertDeletable('person', [{ count: 1, noun: 'transaction' }]);
      throw new Error('expected a throw');
    } catch (err) {
      expect(err).toBeInstanceOf(GraphQLError);
      expect((err as GraphQLError).extensions.code).toBe('CONFLICT');
    }
  });

  it('names a single blocker in the singular', () => {
    expect(messageFor([{ count: 1, noun: 'transaction' }])).toBe(
      'Cannot delete person — still linked to 1 transaction. Remove those first.'
    );
  });

  it('pluralises a count above one', () => {
    expect(messageFor([{ count: 3, noun: 'transaction' }])).toBe(
      'Cannot delete person — still linked to 3 transactions. Remove those first.'
    );
  });

  it('joins two blockers with "and"', () => {
    expect(
      messageFor([
        { count: 1, noun: 'transaction' },
        { count: 2, noun: 'account' },
      ])
    ).toBe('Cannot delete person — still linked to 1 transaction and 2 accounts. Remove those first.');
  });

  it('joins three blockers with commas and a final "and"', () => {
    expect(
      messageFor([
        { count: 4, noun: 'transaction' },
        { count: 2, noun: 'account' },
        { count: 1, noun: 'scenario event' },
      ])
    ).toBe(
      'Cannot delete person — still linked to 4 transactions, 2 accounts and 1 scenario event. Remove those first.'
    );
  });

  it('omits blockers with a zero count', () => {
    expect(
      messageFor([
        { count: 0, noun: 'transaction' },
        { count: 2, noun: 'scenario event' },
      ])
    ).toBe('Cannot delete person — still linked to 2 scenario events. Remove those first.');
  });

  it('uses the entity label it is given', () => {
    try {
      assertDeletable('category', [{ count: 1, noun: 'scenario event' }]);
    } catch (err) {
      expect((err as GraphQLError).message).toContain('Cannot delete category');
    }
  });
});
