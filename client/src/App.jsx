import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { lazy, Suspense } from "react";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

// Lazy loaded pages
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CarbonCalculator = lazy(() => import("./pages/CarbonCalculator"));
const History = lazy(() => import("./pages/History"));
const Goals = lazy(() => import("./pages/Goals"));
const EcoActions = lazy(() => import("./pages/EcoActions"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const UsersManagement = lazy(() => import("./pages/UsersManagement"));
const CarbonManagement = lazy(() => import("./pages/CarbonManagement"));
const GoalsManagement = lazy(() => import("./pages/GoalsManagement"));
const PlatformAnalytics = lazy(() => import("./pages/PlatformAnalytics"));
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
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-h)' }}>Loading EcoTrack...</div>}>
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
