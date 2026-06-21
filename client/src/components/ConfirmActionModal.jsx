import React from "react";

const ConfirmActionModal = ({ 
  title, 
  description, 
  icon = "⚠️", 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  confirmColor = "#ef4444", // default red
  onConfirm, 
  onCancel 
}) => {

  // Generate dynamic styles based on confirmColor
  const getGradient = () => {
    if (confirmColor === "#ef4444") return "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)";
    if (confirmColor === "#3b82f6") return "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)";
    if (confirmColor === "#f97316") return "linear-gradient(135deg, #f97316 0%, #c2410c 100%)";
    return `linear-gradient(135deg, ${confirmColor} 0%, ${confirmColor} 100%)`;
  };

  const hexToRgba = (hex, alpha) => {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="action-modal-overlay" onClick={onCancel}>
      <div 
        className="action-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="action-modal-icon-wrapper"
          style={{
            background: hexToRgba(confirmColor, 0.1),
            border: `1px solid ${hexToRgba(confirmColor, 0.2)}`,
            boxShadow: `0 8px 16px ${hexToRgba(confirmColor, 0.15)}`
          }}
        >
          <span className="action-modal-icon">{icon}</span>
        </div>
        
        <h2 className="action-modal-title">{title}</h2>
        <p className="action-modal-description">
          {description}
        </p>
        
        <div className="action-modal-actions">
          <button className="action-modal-btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className="action-modal-btn-confirm" 
            onClick={onConfirm}
            style={{
              background: getGradient(),
              boxShadow: `0 4px 12px ${hexToRgba(confirmColor, 0.2)}`
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 6px 16px ${hexToRgba(confirmColor, 0.3)}`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 4px 12px ${hexToRgba(confirmColor, 0.2)}`;
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        .action-modal-overlay {
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

        .action-modal-card {
          background: var(--card-glass-bg);
          border: 1px solid var(--card-glass-border);
          border-radius: 20px;
          padding: 32px 24px;
          width: 360px;
          max-width: 90%;
          text-align: center;
          position: relative;
          backdrop-filter: blur(16px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .action-modal-icon-wrapper {
          width: 64px;
          height: 64px;
          margin: 0 auto 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-modal-icon {
          font-size: 28px;
        }

        .action-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-h);
          margin: 0 0 10px;
        }

        .action-modal-description {
          font-size: 14px;
          color: var(--text);
          line-height: 1.5;
          margin: 0 0 28px;
        }

        .action-modal-actions {
          display: flex;
          gap: 12px;
        }

        .action-modal-btn-cancel {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--code-bg);
          color: var(--text-h);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-modal-btn-cancel:hover {
          background: var(--subcard-bg);
        }

        .action-modal-btn-confirm {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: none;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
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

export default ConfirmActionModal;
