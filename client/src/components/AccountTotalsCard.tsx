import { Card, Row, Col, Badge } from 'react-bootstrap';
import type { TotalsFieldsFragment, PersonFieldsFragment } from '../graphql/generated';
import { formatEuro } from '../format';

interface AccountTotalsCardProps {
  totals: TotalsFieldsFragment;
  people: PersonFieldsFragment[];
}

export function AccountTotalsCard({ totals, people }: AccountTotalsCardProps) {
  return (
    <Row className="mb-4">
      <Col md={4}>
        <Card border="info">
          <Card.Body>
            <Card.Title>Net Total</Card.Title>
            <h4 className="text-primary">{formatEuro(totals.net)}</h4>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card>
          <Card.Body>
            <Card.Title>Transaction Totals</Card.Title>
            <div>
              Deposits: <span className="text-success">{formatEuro(totals.totalCredits)}</span>
            </div>
            <div>
              Withdrawals: <span className="text-danger">{formatEuro(totals.totalDebits)}</span>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
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
