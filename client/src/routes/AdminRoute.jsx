import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "../components/Toast";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token && !loading && (!user || user.role !== "admin")) {
      toast.error("Access Denied: Admin role required");
    }
  }, [token, loading, user]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="loading-state-wrapper">
        <div className="spinner"></div>
        <p style={{ marginTop: "12px", color: "#9ca3af" }}>Authenticating admin access...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
