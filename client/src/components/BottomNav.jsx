import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function BottomNav({ toggleSidebar }) {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      path: "/dashboard",
      name: "Home",
      icon: "🏠"
    },
    {
      path: "/calculator",
      name: "Calc",
      icon: "🧮"
    },
    {
      path: "/actions",
      name: "Actions",
      icon: "⚡"
    },
    {
      path: "/leaderboard",
      name: "Rank",
      icon: "🏆"
    }
  ];

  return (
    <nav className="bottom-nav">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${isActive ? "active" : ""}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-text">{item.name}</span>
          </Link>
        );
      })}

      {/* "More" Menu Button to open sidebar */}
      <div 
        className="bottom-nav-item" 
        onClick={toggleSidebar}
        style={{ cursor: "pointer" }}
      >
        <span className="bottom-nav-icon">☰</span>
        <span className="bottom-nav-text">More</span>
      </div>
    </nav>
  );
}

export default BottomNav;
