import React from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
    }
  }
`;

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data, loading } = useQuery(ME_QUERY);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!data?.me) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
