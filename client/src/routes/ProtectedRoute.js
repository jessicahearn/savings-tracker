import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
const ME_QUERY = gql `
  query Me {
    me {
      id
      email
    }
  }
`;
export function ProtectedRoute({ children }) {
    const { data, loading } = useQuery(ME_QUERY);
    if (loading) {
        return _jsx("div", { className: "p-4", children: "Loading..." });
    }
    if (!data?.me) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
//# sourceMappingURL=ProtectedRoute.js.map