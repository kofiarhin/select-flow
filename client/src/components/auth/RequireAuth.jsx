import { Navigate, useLocation } from "react-router-dom";
import useMe from "../../hooks/useMe";

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { data: me, isLoading, isError } = useMe();

  if (!token)
    return <Navigate to="/login" replace state={{ from: location }} />;

  if (isLoading) return <div className="page-loading">Loading...</div>;

  if (isError || !me) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;
