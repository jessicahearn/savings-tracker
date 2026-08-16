import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMeQuery } from '../graphql/generated';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data, loading } = useMeQuery();

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!data?.me) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
