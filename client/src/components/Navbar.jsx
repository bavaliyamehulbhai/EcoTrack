import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markAllRead, markSingleRead, deleteNotification } from "../services/notificationService";
import io from "socket.io-client";
import ConfirmActionModal from "./ConfirmActionModal";

function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user || !user.id) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const socket = io(SOCKET_URL, {
      withCredentials: true
    });

    socket.emit("join", user.id);

    socket.on("notification", (newNotification) => {
      console.log("WebSocket Notification received:", newNotification);
      setNotifications((prev) => {
        // Avoid duplicate additions
        if (prev.some((n) => n._id === newNotification._id)) return prev;
        return [newNotification, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all read", error);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await markSingleRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const getTodayDateStr = () => {
    const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
    return new Date().toLocaleDateString("en-US", options);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <nav className="navbar" aria-label="Main Navigation">
      <div className="navbar-left">
        <button className="hamburger-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="mobile-logo">
          <span className="auth-logo-icon">🌿</span>
          <span className="auth-logo-text">EcoTrack</span>
        </div>
        <div className="navbar-welcome-section">
          <span className="navbar-welcome">
            Welcome back, <span className="highlight">{user?.name || "User"}</span> 👋
          </span>
          <span className="navbar-today">
            📅 Today: {getTodayDateStr()}
          </span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Notification Bell with Dropdown */}
        <div className="notification-bell-container" style={{ position: "relative" }}>
          <div 
            role="button"
            tabIndex={0}
            aria-label="Toggle notifications"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)} 
            onKeyDown={(e) => { if(e.key === 'Enter') setShowNotifDropdown(!showNotifDropdown); }}
            style={{ 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              width: "38px", 
              height: "38px", 
              borderRadius: "50%", 
              background: "var(--subcard-bg)", 
              border: "1px solid var(--subcard-border)", 
              transition: "all 0.2s" 
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px", color: "var(--text-h)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="notification-badge" aria-live="polite" style={{ position: "absolute", top: "-4px", right: "-4px" }}>{unreadCount}</span>
            )}
          </div>

          {showNotifDropdown && (
            <div style={{
              position: "absolute",
              top: "45px",
              right: "0",
              width: "320px",
              maxWidth: "calc(100vw - 32px)",
              background: "var(--card-glass-bg)",
              border: "1px solid var(--card-glass-border)",
              borderRadius: "14px",
              boxShadow: "var(--shadow)",
              backdropFilter: "blur(12px)",
              zIndex: 1000,
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                <span style={{ fontWeight: "700", color: "var(--text-h)", fontSize: "14px" }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} style={{ background: "none", border: "none", color: "#22c55e", fontSize: "12px", cursor: "pointer", fontWeight: "600", padding: "0" }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "20px 0", textAlign: "center", color: "#6b7280", fontSize: "13px" }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                       key={n._id}
                       onClick={() => !n.isRead && handleMarkSingleRead(n._id)}
                       style={{
                         padding: "10px 12px",
                         borderRadius: "8px",
                         background: n.isRead ? "transparent" : "rgba(34, 197, 94, 0.08)",
                         border: n.isRead ? "1px solid transparent" : "1px solid rgba(34, 197, 94, 0.2)",
                         cursor: n.isRead ? "default" : "pointer",
                         transition: "all 0.2s"
                       }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontWeight: "600", fontSize: "12.5px", color: n.isRead ? "var(--text)" : "var(--text-h)" }}>
                          {n.title}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {!n.isRead && (
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
                          )}
                          <button
                            onClick={(e) => handleDeleteNotification(e, n._id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              padding: "2px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "4px",
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                            onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                            title="Delete notification"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "14px", height: "14px" }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: "11.5px", color: n.isRead ? "#6b7280" : "var(--text)", margin: 0, lineHeight: "1.4" }}>
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {user && (
          <div style={{ position: "relative" }}>
            <div 
              role="button"
              tabIndex={0}
              aria-label="Profile menu"
              className="navbar-profile" 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              onKeyDown={(e) => { if(e.key === 'Enter') setShowProfileDropdown(!showProfileDropdown); }}
              style={{ 
                cursor: "pointer", 
                padding: "4px 14px 4px 4px", 
                borderRadius: "30px", 
                background: "var(--subcard-bg)", 
                border: "1px solid var(--subcard-border)",
                transition: "all 0.2s"
              }}
            >
              <div className="navbar-avatar" style={{ width: "32px", height: "32px", fontSize: "14px" }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="navbar-user-info" style={{ marginRight: "4px" }}>
                <span className="navbar-username" style={{ fontSize: "13px" }}>{user.name}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "14px", height: "14px", color: "var(--text)", marginLeft: "4px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>

            {showProfileDropdown && (
              <div style={{
                position: "absolute",
                top: "50px",
                right: "0",
                width: "220px",
                maxWidth: "calc(100vw - 32px)",
                background: "var(--card-glass-bg)",
                border: "1px solid var(--card-glass-border)",
                borderRadius: "14px",
                boxShadow: "var(--shadow)",
                backdropFilter: "blur(12px)",
                zIndex: 1000,
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                <div style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "600", color: "var(--text-h)", fontSize: "14px" }}>{user.name}</span>
                  <span style={{ color: "#6b7280", fontSize: "12px" }}>{user.email}</span>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Link 
                    to="/settings"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      color: "var(--text-h)",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: "500",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "var(--subcard-bg)"}
                    onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "16px", height: "16px", color: "#9ca3af" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    Profile Settings
                  </Link>

                  <button 
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setShowLogoutModal(true);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "none",
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#ef4444",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                    onMouseOut={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "16px", height: "16px" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>

      {showLogoutModal && (
        <ConfirmActionModal 
          title="Ready to leave?"
          description="Are you sure you want to log out of EcoTrack? Your session will be securely closed."
          icon="🚪"
          confirmText="Yes, Log Out"
          confirmColor="#ef4444"
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={() => {
            setShowLogoutModal(false);
            logout();
          }}
        />
      )}
    </>
  );
}

export default Navbar;
