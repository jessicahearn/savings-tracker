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
    <Navbar bg="light" expand="lg" className="border-bottom">
      <Navbar.Brand href="/" className="fw-bold">
        💰 Savings Tracker
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
          {data?.me && (
            <>
              <Nav.Link href="/people">People</Nav.Link>
              <Nav.Link href="/categories">Categories</Nav.Link>
              <Nav.Link onClick={handleSignOut}>Sign Out</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
