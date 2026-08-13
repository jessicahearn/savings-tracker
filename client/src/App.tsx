import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { NavBar } from './components/NavBar';

export function App() {
  return (
    <Router>
      <NavBar />
      <Container className="py-4">
        <Routes>
          <Route path="/login" element={<div>Login Page (TODO)</div>} />
          <Route path="/signup" element={<div>Signup Page (TODO)</div>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Accounts List (TODO)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts/:id"
            element={
              <ProtectedRoute>
                <div>Account Detail (TODO)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/people"
            element={
              <ProtectedRoute>
                <div>People Management (TODO)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <div>Categories Management (TODO)</div>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Router>
  );
}
