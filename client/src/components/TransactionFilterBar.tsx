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

function selectedValues(e: React.ChangeEvent<HTMLSelectElement>): string[] {
  return Array.from(e.target.selectedOptions, (option) => option.value);
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
            <Form.Group controlId="filter-person">
              <Form.Label>By Person (hold Ctrl/Cmd for multiple)</Form.Label>
              <Form.Select
                multiple
                value={personIds}
                onChange={(e) => onPersonIdsChange(selectedValues(e))}
              >
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="filter-category">
              <Form.Label>By Category (hold Ctrl/Cmd for multiple)</Form.Label>
              <Form.Select
                multiple
                value={categoryIds}
                onChange={(e) => onCategoryIdsChange(selectedValues(e))}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
