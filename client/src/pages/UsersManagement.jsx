import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/authService";
import { getUsers, blockUser, deleteUser, bulkBlockUsers, bulkDeleteUsers, getAuditLogs } from "../services/adminService";
import DashboardLayout from "../layouts/DashboardLayout";
import { toast } from "../components/Toast";
import ConfirmActionModal from "../components/ConfirmActionModal";

function UsersManagement() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState(null);
  const navigate = useNavigate();

  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isAuditLoading, setIsAuditLoading] = useState(false);

  const fetchAuditLogs = async () => {
    setIsAuditLoading(true);
    try {
      const logs = await getAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error("Failed to load audit logs", error);
      toast.error("Failed to retrieve audit log history");
    } finally {
      setIsAuditLoading(false);
    }
  };

  const handleCheckboxChange = (userId) => {
    setSelectedUserIds((prev) => 
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const selectableIds = filteredUsers
        .filter((u) => u._id !== user?.id && u.role !== "admin")
        .map((u) => u._id);
      setSelectedUserIds(selectableIds);
    } else {
      setSelectedUserIds([]);
    }
  };

  const executeBulkBlock = async () => {
    try {
      const res = await bulkBlockUsers(selectedUserIds);
      toast.success(res.message);
      setSelectedUserIds([]);
      loadData();
    } catch (error) {
      console.error("Bulk block failed", error);
      toast.error(error.response?.data?.message || "Failed to block users in bulk");
    } finally {
      setModalConfig(null);
    }
  };

  const handleBulkBlock = () => {
    if (selectedUserIds.length === 0) return;
    setModalConfig({
      title: "Bulk Suspend Users",
      description: `Are you sure you want to suspend these ${selectedUserIds.length} users? They will be denied access to their accounts.`,
      icon: "⛔",
      confirmText: "Yes, Suspend",
      confirmColor: "#f97316",
      onConfirm: executeBulkBlock
    });
  };

  const executeBulkDelete = async () => {
    try {
      const res = await bulkDeleteUsers(selectedUserIds);
      toast.success(res.message);
      setSelectedUserIds([]);
      loadData();
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(error.response?.data?.message || "Failed to delete users in bulk");
    } finally {
      setModalConfig(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) return;
    setModalConfig({
      title: "Bulk Delete Users",
      description: `CAUTION: Are you sure you want to permanently delete these ${selectedUserIds.length} users and all their associated records? This action is irreversible.`,
      icon: "🗑️",
      confirmText: "Yes, Delete All",
      confirmColor: "#ef4444",
      onConfirm: executeBulkDelete
    });
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const profile = await getProfile();
      if (profile.role !== "admin") {
        toast.error("Access Denied: Admin role required");
        navigate("/dashboard");
        return;
      }
      setUser(profile);

      const usersList = await getUsers();
      setUsers(usersList);
    } catch (error) {
      console.error("Users list load failed", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  const executeBlockToggle = async (userId) => {
    try {
      const res = await blockUser(userId);
      toast.success(res.message);
      loadData();
    } catch (error) {
      console.error("Block action failed", error);
      toast.error(error.response?.data?.message || "Failed to block/unblock user");
    } finally {
      setModalConfig(null);
    }
  };

  const handleBlockToggle = (userObj) => {
    const isBlocking = !userObj.isBlocked;
    setModalConfig({
      title: isBlocking ? "Suspend User" : "Unblock User",
      description: isBlocking 
        ? `Are you sure you want to suspend ${userObj.name}? They will be denied access to the platform.` 
        : `Are you sure you want to restore access for ${userObj.name}?`,
      icon: isBlocking ? "⛔" : "🔓",
      confirmText: isBlocking ? "Yes, Suspend" : "Yes, Unblock",
      confirmColor: isBlocking ? "#f97316" : "#22c55e",
      onConfirm: () => executeBlockToggle(userObj._id)
    });
  };

  const executeDeleteUser = async (userId) => {
    try {
      const res = await deleteUser(userId);
      toast.success(res.message);
      loadData();
    } catch (error) {
      console.error("Delete user action failed", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setModalConfig(null);
    }
  };

  const handleDeleteUser = (userId) => {
    setModalConfig({
      title: "Delete User",
      description: "CAUTION: Are you sure you want to permanently delete this user and all associated carbon records, goals, and logged actions? This action is irreversible.",
      icon: "🗑️",
      confirmText: "Yes, Delete User",
      confirmColor: "#ef4444",
      onConfirm: () => executeDeleteUser(userId)
    });
  };

  const logoutHandler = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout user={user} onLogout={logoutHandler}>
      {isLoading ? (
        <div className="loading-state-wrapper">
          <div className="spinner"></div>
          <p style={{ marginTop: "12px", color: "#9ca3af" }}>Loading users directory...</p>
        </div>
      ) : (
        <div className="dashboard-grid-layout" style={{ gap: "24px" }}>
          
          {/* Header Card */}
          <div className="welcome-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", padding: "30px", marginBottom: "0", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 className="welcome-title" style={{ fontSize: "28px", margin: "0 0 8px 0" }}>👥 Users Directory Management</h1>
              <p className="welcome-email" style={{ justifyContent: "flex-start", marginBottom: "0" }}>
                Search, verify roles, suspend profiles, or permanently delete platform members.
              </p>
            </div>
            <button 
              className="quick-action-btn primary"
              onClick={() => {
                setShowAuditDrawer(true);
                fetchAuditLogs();
              }}
              style={{ padding: "10px 20px", fontSize: "13px", height: "fit-content", background: "linear-gradient(135deg, #a855f7 0%, #6d28d9 100%)", border: "none" }}
            >
              🛡️ Audit Log History
            </button>
          </div>

          {/* User Table Container */}
          <div className="welcome-card" style={{ padding: "24px 30px", marginBottom: "0", textAlign: "left" }}>
            
            {/* Filter Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <h3 className="card-heading-title" style={{ margin: 0 }}>All Registered Profiles</h3>
              <input
                type="text"
                placeholder="🔍 Search name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "#090d12",
                  color: "#fff",
                  fontSize: "13.5px",
                  width: "260px"
                }}
              />
            </div>

            {/* Table */}
            {filteredUsers.length === 0 ? (
              <div className="empty-state-design" style={{ padding: "40px 0" }}>
                <p className="empty-state-text">No profiles matched your search</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#6b7280", textAlign: "left" }}>
                      <th style={{ padding: "12px 8px", width: "40px" }}>
                        <input 
                          type="checkbox" 
                          onChange={handleSelectAll} 
                          checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.filter(u => u._id !== user?.id && u.role !== 'admin').length}
                        />
                      </th>
                      <th style={{ padding: "12px 8px" }}>Name</th>
                      <th style={{ padding: "12px 8px" }}>Email</th>
                      <th style={{ padding: "12px 8px" }}>Role</th>
                      <th style={{ padding: "12px 8px" }}>Status</th>
                      <th style={{ padding: "12px 8px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isSelf = user && u._id === user.id;
                      const canBeBulkActioned = !isSelf && u.role !== "admin";

                      return (
                        <tr
                          key={u._id}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.03)",
                            background: isSelf ? "rgba(34,197,94,0.02)" : selectedUserIds.includes(u._id) ? "rgba(59, 130, 246, 0.05)" : "transparent"
                          }}
                        >
                          <td style={{ padding: "14px 8px" }}>
                            {canBeBulkActioned ? (
                              <input 
                                type="checkbox" 
                                checked={selectedUserIds.includes(u._id)} 
                                onChange={() => handleCheckboxChange(u._id)}
                              />
                            ) : (
                              <input type="checkbox" disabled style={{ opacity: 0.15 }} />
                            )}
                          </td>
                          <td style={{ padding: "14px 8px", fontWeight: "600", color: "#fff" }}>
                            {u.name} {isSelf && <span style={{ color: "#22c55e", fontSize: "11px" }}>(you)</span>}
                          </td>
                          <td style={{ padding: "14px 8px", color: "#9ca3af" }}>{u.email}</td>
                          <td style={{ padding: "14px 8px" }}>
                            <span className="profile-card-role-badge" style={{
                              fontSize: "10.5px",
                              background: u.role === "admin" ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.08)",
                              color: u.role === "admin" ? "#ef4444" : "#22c55e",
                              borderColor: "transparent"
                            }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: "14px 8px" }}>
                            {u.isBlocked ? (
                              <span style={{ color: "#ef4444", fontWeight: "700", fontSize: "12.5px" }}>⚠️ Suspended</span>
                            ) : (
                              <span style={{ color: "#22c55e", fontWeight: "600", fontSize: "12.5px" }}>🟢 Active</span>
                            )}
                          </td>
                          <td style={{ padding: "14px 8px", textAlign: "right" }}>
                            {!isSelf && u.role !== "admin" ? (
                              <div style={{ display: "inline-flex", gap: "8px" }}>
                                <button
                                  className="quick-action-btn secondary"
                                  onClick={() => handleBlockToggle(u)}
                                  style={{
                                    padding: "6px 12px",
                                    fontSize: "12px",
                                    color: u.isBlocked ? "#22c55e" : "#f97316",
                                    borderColor: u.isBlocked ? "rgba(34,197,94,0.2)" : "rgba(249,115,22,0.2)"
                                  }}
                                >
                                  {u.isBlocked ? "🔓 Unblock" : "⛔ Block"}
                                </button>
                                <button
                                  className="logout-btn"
                                  onClick={() => handleDeleteUser(u._id)}
                                  style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "8px" }}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: "#6b7280", fontSize: "12px" }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bulk Actions Panel */}
          {selectedUserIds.length > 0 && (
            <div className="bulk-actions-floating-panel">
              <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#fff" }}>
                Selected <strong>{selectedUserIds.length}</strong> users
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  className="quick-action-btn secondary"
                  style={{ padding: "8px 16px", fontSize: "12.5px", color: "#f97316", borderColor: "rgba(249,115,22,0.3)" }}
                  onClick={handleBulkBlock}
                >
                  ⛔ Bulk Block
                </button>
                <button 
                  className="logout-btn"
                  style={{ padding: "8px 16px", fontSize: "12.5px", borderRadius: "8px" }}
                  onClick={handleBulkDelete}
                >
                  🗑️ Bulk Delete
                </button>
                <button 
                  className="quick-action-btn secondary"
                  style={{ padding: "8px 16px", fontSize: "12.5px", color: "#9ca3af", borderColor: "rgba(255,255,255,0.1)" }}
                  onClick={() => setSelectedUserIds([])}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Audit Logs Drawer */}
          {showAuditDrawer && (
            <div className="audit-drawer-overlay" onClick={() => setShowAuditDrawer(false)}>
              <div className="audit-drawer-content" onClick={(e) => e.stopPropagation()}>
                <div className="audit-drawer-header">
                  <h3>🛡️ Administrative Audit Logs</h3>
                  <button className="audit-drawer-close" onClick={() => setShowAuditDrawer(false)}>&times;</button>
                </div>
                
                <div className="audit-drawer-body">
                  {isAuditLoading ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                      <div className="spinner"></div>
                      <p style={{ marginTop: "12px", color: "#9ca3af" }}>Loading audit records...</p>
                    </div>
                  ) : auditLogs.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#6b7280", padding: "40px 0" }}>No audit log records found.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {auditLogs.map((log) => (
                        <div key={log._id} className="audit-log-item">
                          <div className="audit-log-meta">
                            <span className="audit-log-admin">🧑‍💼 {log.adminName}</span>
                            <span className={`audit-log-action ${log.action === 'delete' ? 'delete-action' : 'block-action'}`}>
                              {log.action.toUpperCase()}
                            </span>
                          </div>
                          <p className="audit-log-details">{log.details}</p>
                          <span className="audit-log-time">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Custom Styles */}
          <style>{`
            .audit-drawer-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.6);
              backdrop-filter: blur(6px);
              z-index: 1050;
              display: flex;
              justify-content: flex-end;
              animation: fadeIn 0.25s ease-out;
            }
            .audit-drawer-content {
              width: 450px;
              max-width: 90%;
              height: 100%;
              background: rgba(18, 22, 33, 0.98);
              border-left: 1px solid rgba(255, 255, 255, 0.08);
              box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
              display: flex;
              flex-direction: column;
              padding: 24px;
              box-sizing: border-box;
              animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .audit-drawer-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid rgba(255, 255, 255, 0.06);
              padding-bottom: 16px;
              margin-bottom: 16px;
            }
            .audit-drawer-header h3 {
              margin: 0;
              font-size: 18px;
              color: #fff;
            }
            .audit-drawer-close {
              background: transparent;
              border: none;
              color: #9ca3af;
              font-size: 28px;
              cursor: pointer;
            }
            .audit-drawer-body {
              flex: 1;
              overflow-y: auto;
              padding-right: 4px;
            }
            .audit-log-item {
              background: rgba(255, 255, 255, 0.02);
              border: 1px solid rgba(255, 255, 255, 0.04);
              border-radius: 10px;
              padding: 12px;
              display: flex;
              flex-direction: column;
              gap: 6px;
            }
            .audit-log-meta {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .audit-log-admin {
              font-weight: 600;
              color: #e5e7eb;
              font-size: 13px;
            }
            .audit-log-action {
              font-size: 10px;
              font-weight: 800;
              padding: 2px 6px;
              border-radius: 4px;
            }
            .delete-action {
              background: rgba(239, 68, 68, 0.15);
              color: #ef4444;
              border: 1px solid rgba(239, 68, 68, 0.3);
            }
            .block-action {
              background: rgba(249, 115, 22, 0.15);
              color: #f97316;
              border: 1px solid rgba(249, 115, 22, 0.3);
            }
            .audit-log-details {
              margin: 0;
              font-size: 12.5px;
              color: #9ca3af;
              line-height: 1.4;
            }
            .audit-log-time {
              font-size: 10.5px;
              color: #6b7280;
              align-self: flex-end;
            }
            
            .bulk-actions-floating-panel {
              position: fixed;
              bottom: 24px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(18, 22, 33, 0.95);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 16px;
              padding: 14px 24px;
              display: flex;
              align-items: center;
              gap: 20px;
              z-index: 1000;
              box-shadow: 0 15px 30px rgba(0,0,0,0.5);
              backdrop-filter: blur(12px);
              animation: floatUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            
            @keyframes floatUp {
              from { transform: translate(-50%, 100px); opacity: 0; }
              to { transform: translate(-50%, 0); opacity: 1; }
            }
            @keyframes slideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </div>
      )}

      {modalConfig && (
        <ConfirmActionModal 
          {...modalConfig} 
          onCancel={() => setModalConfig(null)} 
        />
      )}
    </DashboardLayout>
  );
}

export default UsersManagement;
