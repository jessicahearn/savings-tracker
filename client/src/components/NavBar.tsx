import { Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useMeQuery, useSignOutMutation } from '../graphql/generated';

export function NavBar() {
  const { data } = useMeQuery();
  const [signOut] = useSignOutMutation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <Navbar bg="primary" expand="lg" className="border-bottom p-3">
      <Navbar.Brand href="/" className="fw-bold text-secondary">
        € SAVINGS TRACKER
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
          {data?.me && (
            <>
              <Nav.Link className="text-white" href="/">Accounts</Nav.Link>
              <Nav.Link className="text-white" href="/people">People</Nav.Link>
              <Nav.Link className="text-white" href="/categories">Categories</Nav.Link>
              <Nav.Link className="text-white" onClick={handleSignOut}>Sign Out</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
