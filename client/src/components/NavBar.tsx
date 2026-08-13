import { Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
    }
  }
`;

const SIGN_OUT_MUTATION = gql`
  mutation SignOut {
    signOut
  }
`;

export function NavBar() {
  const { data } = useQuery(ME_QUERY);
  const [signOut] = useMutation(SIGN_OUT_MUTATION);
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
