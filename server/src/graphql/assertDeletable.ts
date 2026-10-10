import { GraphQLError } from 'graphql';

export interface DeleteBlocker {
  /** How many rows reference the entity. Zero means not a blocker. */
  count: number;
  /** Singular noun, e.g. 'transaction'. Pluralised automatically. */
  noun: string;
}

/** 'a' | 'a and b' | 'a, b and c' */
function formatList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function pluralise({ count, noun }: DeleteBlocker): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

/**
 * Throws a CONFLICT naming every reason a delete is blocked, or returns
 * quietly when there are none.
 *
 * People and categories are referenced by several tables, all ON DELETE
 * RESTRICT. Attempting the DELETE and letting Postgres object produces an
 * unreadable foreign-key error, so each reference is counted first — and all of
 * them are reported together, so the user is not told to clear transactions,
 * does that, and is then told about scenario events.
 *
 * Every new table referencing people or categories needs a blocker added at the
 * call site. Forgetting is the recurring bug this exists to make obvious.
 */
export function assertDeletable(entityLabel: string, blockers: DeleteBlocker[]): void {
  const reasons = blockers.filter((b) => b.count > 0).map(pluralise);
  if (reasons.length === 0) return;

  throw new GraphQLError(
    `Cannot delete ${entityLabel} — still linked to ${formatList(reasons)}. Remove those first.`,
    { extensions: { code: 'CONFLICT' } }
  );
}
