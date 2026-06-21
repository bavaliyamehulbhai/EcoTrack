import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CarbonCalculator from "./pages/CarbonCalculator";
import History from "./pages/History";
import Goals from "./pages/Goals";
import EcoActions from "./pages/EcoActions";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import UsersManagement from "./pages/UsersManagement";
import CarbonManagement from "./pages/CarbonManagement";
import GoalsManagement from "./pages/GoalsManagement";
import PlatformAnalytics from "./pages/PlatformAnalytics";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import { ToastContainer } from "./components/Toast";
import { AuthProvider } from "./context/AuthContext";

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          {/* Default: redirect root to /login */}
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

        <Route
          path="/calculator"
          element={
            <ProtectedRoute>
              <CarbonCalculator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/actions"
          element={
            <ProtectedRoute>
              <EcoActions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Administrative panel routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UsersManagement />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/carbon"
          element={
            <AdminRoute>
              <CarbonManagement />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/goals"
          element={
            <AdminRoute>
              <GoalsManagement />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <AdminRoute>
              <PlatformAnalytics />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
  );
}

export default App;
