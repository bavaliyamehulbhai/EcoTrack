import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar({ isOpen, toggleSidebar }) {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: "🏠"
    },
    {
      path: "/calculator",
      name: "Calculator",
      icon: "🧮"
    },
    {
      path: "/history",
      name: "History",
      icon: "📜"
    },
    {
      path: "/goals",
      name: "Goals",
      icon: "🎯"
    },
    {
      path: "/actions",
      name: "Eco Actions",
      icon: "⚡"
    },
    {
      path: "/leaderboard",
      name: "Leaderboard",
      icon: "🏆"
    },
    {
      path: "/settings",
      name: "Settings",
      icon: "⚙️"
    }
  ];

  const adminMenuItems = [
    {
      path: "/admin/dashboard",
      name: "Admin Dashboard",
      icon: "⚙️"
    },
    {
      path: "/admin/users",
      name: "Users Management",
      icon: "👥"
    },
    {
      path: "/admin/carbon",
      name: "Carbon Records",
      icon: "🌱"
    },
    {
      path: "/admin/goals",
      name: "Goals Management",
      icon: "🏁"
    },
    {
      path: "/admin/analytics",
      name: "Platform Analytics",
      icon: "📈"
    }
  ];

  const isAdmin = user && user.role === "admin";

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="nav-brand">
          <span className="auth-logo-icon">🌿</span>
          <span className="auth-logo-text">EcoTrack</span>
        </div>
        <button className="sidebar-close-btn" onClick={toggleSidebar}>
          ✕
        </button>
      </div>

      <nav className="sidebar-nav-menu">
        <div style={{
          padding: "0 16px 8px 16px",
          fontSize: "11px",
          fontWeight: "700",
          textTransform: "uppercase",
          color: "#4b5563",
          letterSpacing: "0.5px"
        }}>
          Core Panel
        </div>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? "active" : ""}`}
              onClick={() => isOpen && toggleSidebar()}
            >
              <span className="sidebar-link-icon" style={{ fontSize: "18px", marginRight: "8px" }}>
                {item.icon}
              </span>
              <span className="sidebar-link-text">{item.name}</span>
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div style={{
              padding: "16px 16px 8px 16px",
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              color: "#4b5563",
              borderTop: "1px solid rgba(255, 255, 255, 0.05)",
              marginTop: "16px",
              letterSpacing: "0.5px"
            }}>
              Admin Room
            </div>
            {adminMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                  onClick={() => isOpen && toggleSidebar()}
                >
                  <span className="sidebar-link-icon" style={{ fontSize: "18px", marginRight: "8px" }}>
                    {item.icon}
                  </span>
                  <span className="sidebar-link-text">{item.name}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-card">
          <h4>Be Eco-Friendly!</h4>
          <p>Every step counts to reduce global warming.</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
