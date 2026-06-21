function ProfileCard({ user }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="welcome-card profile-card">
      <div className="profile-card-header">
        <div className="profile-card-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h3 className="profile-card-name">{user?.name}</h3>
        <span className="profile-card-role-badge">
          {user?.role ? user.role.toUpperCase() : "USER"}
        </span>
      </div>

      <div className="profile-card-details">
        <div className="profile-detail-row">
          <span className="detail-label">Email</span>
          <span className="detail-value">{user?.email}</span>
        </div>
        <div className="profile-detail-row">
          <span className="detail-label">Joined</span>
          <span className="detail-value">{formatDate(user?.createdAt)}</span>
        </div>
        <div className="profile-detail-row">
          <span className="detail-label">Status</span>
          <span className="detail-value status-active">Active</span>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
