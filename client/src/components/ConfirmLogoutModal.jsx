import React from "react";

const ConfirmLogoutModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="logout-modal-overlay" onClick={onCancel}>
      <div 
        className="logout-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="logout-modal-icon-wrapper">
          <span className="logout-modal-icon">🚪</span>
        </div>
        
        <h2 className="logout-modal-title">Ready to leave?</h2>
        <p className="logout-modal-description">
          Are you sure you want to log out of EcoTrack? Your session will be securely closed.
        </p>
        
        <div className="logout-modal-actions">
          <button className="logout-modal-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="logout-modal-btn-confirm" onClick={onConfirm}>
            Yes, Log Out
          </button>
        </div>
      </div>

      <style>{`
        .logout-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
          animation: fadeIn 0.2s ease-out;
        }

        .logout-modal-card {
          background: var(--card-glass-bg);
          border: 1px solid var(--card-glass-border);
          border-radius: 20px;
          padding: 32px 24px;
          width: 340px;
          max-width: 90%;
          text-align: center;
          position: relative;
          backdrop-filter: blur(16px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .logout-modal-icon-wrapper {
          width: 64px;
          height: 64px;
          margin: 0 auto 20px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(239, 68, 68, 0.15);
        }

        .logout-modal-icon {
          font-size: 28px;
        }

        .logout-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-h);
          margin: 0 0 10px;
        }

        .logout-modal-description {
          font-size: 14px;
          color: #9ca3af;
          line-height: 1.5;
          margin: 0 0 28px;
        }

        .logout-modal-actions {
          display: flex;
          gap: 12px;
        }

        .logout-modal-btn-cancel {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: #e5e7eb;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-modal-btn-cancel:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .logout-modal-btn-confirm {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .logout-modal-btn-confirm:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ConfirmLogoutModal;
