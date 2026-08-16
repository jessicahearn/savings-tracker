import { Card, Row, Col, Form } from 'react-bootstrap';
import type { PersonFieldsFragment, CategoryFieldsFragment } from '../graphql/generated';

interface TransactionFilterBarProps {
  people: PersonFieldsFragment[];
  categories: CategoryFieldsFragment[];
  personIds: string[];
  categoryIds: string[];
  onPersonIdsChange: (ids: string[]) => void;
  onCategoryIdsChange: (ids: string[]) => void;
}

/**
 * Adds or removes a single id, then rebuilds the array in list order rather
 * than click order. Order does not affect the query itself (the server uses
 * `= ANY(...)`), but Apollo keys its cache on the serialised variables — so
 * ['1','2'] and ['2','1'] would be two cache entries for one logical filter.
 */
function toggleId(
  current: string[],
  id: string,
  checked: boolean,
  all: ReadonlyArray<{ id: string }>
): string[] {
  const next = new Set(current);
  if (checked) next.add(id);
  else next.delete(id);
  return all.filter((item) => next.has(item.id)).map((item) => item.id);
}

export function TransactionFilterBar({
  people,
  categories,
  personIds,
  categoryIds,
  onPersonIdsChange,
  onCategoryIdsChange,
}: TransactionFilterBarProps) {
  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Filters</Card.Title>
        <Row>
          <Col md={6}>
            {/* fieldset/legend is the correct grouping for related checkboxes —
                screen readers announce the group name before each option. */}
            <fieldset>
              <legend className="form-label fs-6 float-none">By Person</legend>
              {people.length === 0 ? (
                <span className="text-muted">No people yet.</span>
              ) : (
                people.map((person) => (
                  <Form.Check
                    key={person.id}
                    type="checkbox"
                    // Each check needs its own id. Do NOT put controlId on a
                    // wrapping Form.Group: it would give every checkbox here the
                    // same id, so every label would point at the first one.
                    id={`filter-person-${person.id}`}
                    label={person.name}
                    checked={personIds.includes(person.id)}
                    onChange={(e) =>
                      onPersonIdsChange(toggleId(personIds, person.id, e.target.checked, people))
                    }
                  />
                ))
              )}
            </fieldset>
          </Col>
          <Col md={6}>
            <fieldset>
              <legend className="form-label fs-6 float-none">By Category</legend>
              {categories.length === 0 ? (
                <span className="text-muted">No categories yet.</span>
              ) : (
                categories.map((category) => (
                  <Form.Check
                    key={category.id}
                    type="checkbox"
                    id={`filter-category-${category.id}`}
                    label={category.name}
                    checked={categoryIds.includes(category.id)}
                    onChange={(e) =>
                      onCategoryIdsChange(
                        toggleId(categoryIds, category.id, e.target.checked, categories)
                      )
                    }
                  />
                ))
              )}
            </fieldset>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
