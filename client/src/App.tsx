import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { NavBar } from './components/NavBar';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AccountsList } from './pages/AccountsList';
import { AccountDetail } from './pages/AccountDetail';
import { PeopleManagement } from './pages/PeopleManagement';
import { CategoriesManagement } from './pages/CategoriesManagement';

export function App() {
  return (
    <Router>
      <NavBar />
      <Container className="py-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AccountsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts/:id"
            element={
              <ProtectedRoute>
                <AccountDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/people"
            element={
              <ProtectedRoute>
                <PeopleManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <CategoriesManagement />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Router>
  );
}
