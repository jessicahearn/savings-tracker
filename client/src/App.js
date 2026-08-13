import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { NavBar } from './components/NavBar';
export function App() {
    return (_jsxs(Router, { children: [_jsx(NavBar, {}), _jsx(Container, { className: "py-4", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx("div", { children: "Login Page (TODO)" }) }), _jsx(Route, { path: "/signup", element: _jsx("div", { children: "Signup Page (TODO)" }) }), _jsx(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx("div", { children: "Accounts List (TODO)" }) }) }), _jsx(Route, { path: "/accounts/:id", element: _jsx(ProtectedRoute, { children: _jsx("div", { children: "Account Detail (TODO)" }) }) }), _jsx(Route, { path: "/people", element: _jsx(ProtectedRoute, { children: _jsx("div", { children: "People Management (TODO)" }) }) }), _jsx(Route, { path: "/categories", element: _jsx(ProtectedRoute, { children: _jsx("div", { children: "Categories Management (TODO)" }) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) })] }));
}
//# sourceMappingURL=App.js.map