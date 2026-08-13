import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
const ME_QUERY = gql `
  query Me {
    me {
      id
      email
    }
  }
`;
const SIGN_OUT_MUTATION = gql `
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
        }
        catch (error) {
            console.error('Sign out failed:', error);
        }
    };
    return (_jsxs(Navbar, { bg: "light", expand: "lg", className: "border-bottom", children: [_jsx(Navbar.Brand, { href: "/", className: "fw-bold", children: "\uD83D\uDCB0 Savings Tracker" }), _jsx(Navbar.Toggle, { "aria-controls": "basic-navbar-nav" }), _jsx(Navbar.Collapse, { id: "basic-navbar-nav", children: _jsx(Nav, { className: "ms-auto", children: data?.me && (_jsxs(_Fragment, { children: [_jsx(Nav.Link, { href: "/people", children: "People" }), _jsx(Nav.Link, { href: "/categories", children: "Categories" }), _jsx(Nav.Link, { onClick: handleSignOut, children: "Sign Out" })] })) }) })] }));
}
//# sourceMappingURL=NavBar.js.map