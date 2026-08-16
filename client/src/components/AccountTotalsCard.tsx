import { Card, Row, Col, Badge } from 'react-bootstrap';
import type { TotalsFieldsFragment, PersonFieldsFragment } from '../graphql/generated';

interface AccountTotalsCardProps {
  totals: TotalsFieldsFragment;
  people: PersonFieldsFragment[];
}

export function AccountTotalsCard({ totals, people }: AccountTotalsCardProps) {
  return (
    <Row className="mb-4">
      <Col md={3}>
        <Card>
          <Card.Body>
            <Card.Title>Deposits</Card.Title>
            <h4 className="text-success">${totals.totalCredits.toFixed(2)}</h4>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card>
          <Card.Body>
            <Card.Title>Withdrawals</Card.Title>
            <h4 className="text-danger">${Math.abs(totals.totalDebits).toFixed(2)}</h4>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card>
          <Card.Body>
            <Card.Title>Net</Card.Title>
            <h4 className={totals.net >= 0 ? 'text-success' : 'text-danger'}>
              ${totals.net.toFixed(2)}
            </h4>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card>
          <Card.Body>
            <Card.Title>People</Card.Title>
            <div>
              {people.length > 0 ? (
                people.map((p) => (
                  <Badge key={p.id} bg="info" className="me-1">
                    {p.name}
                  </Badge>
                ))
              ) : (
                <span className="text-muted">—</span>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
