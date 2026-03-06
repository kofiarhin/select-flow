import { Navigate } from "react-router-dom";
import useMe from "../../hooks/useMe";

const PublicOnly = ({ children }) => {
  const token = localStorage.getItem("token");
  const { data: me, isLoading } = useMe();

  if (token && isLoading) return <div className="page-loading">Loading...</div>;

  if (token && me) return <Navigate to="/dashboard" replace />;

  return children;
};

export default PublicOnly;
