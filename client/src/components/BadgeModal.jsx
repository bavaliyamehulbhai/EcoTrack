import React, { useState } from "react";

const badgeDetails = {
  "Eco Beginner": {
    icon: "🌱",
    color: "#4ade80",
    gradient: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
    glow: "0 0 25px rgba(74, 222, 128, 0.4)",
    description: "You've taken your first step towards a greener footprint by logging eco-friendly actions.",
    requirements: "Earn 50+ total Eco Points."
  },
  "Eco Warrior": {
    icon: "🛡️",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    glow: "0 0 25px rgba(59, 130, 246, 0.4)",
    description: "You consistently log green habits and represent a key defender of our planet.",
    requirements: "Earn 150+ total Eco Points."
  },
  "Green Champion": {
    icon: "👑",
    color: "#a855f7",
    gradient: "linear-gradient(135deg, #a855f7 0%, #6d28d9 100%)",
    glow: "0 0 25px rgba(168, 85, 247, 0.4)",
    description: "An elite planetary advocate. Your environmental choices lead the entire community.",
    requirements: "Earn 300+ total Eco Points."
  }
};

const BadgeModal = ({ badgeName, onClose }) => {
  const [copied, setCopied] = useState(false);
  const details = badgeDetails[badgeName] || {
    icon: "🏆",
    color: "#eab308",
    gradient: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
    glow: "0 0 25px rgba(234, 179, 8, 0.4)",
    description: "Special achievement badge awarded for your outstanding eco-friendly logs.",
    requirements: "Special unlock event."
  };

  const handleShare = () => {
    const text = `I just unlocked the ${badgeName} badge on EcoTrack! ${details.icon} Join me in logging sustainable actions and reducing carbon emissions! #EcoTrack`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="badge-modal-overlay" onClick={onClose}>
      <div 
        className="badge-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: details.glow
        }}
      >
        <button className="badge-modal-close" onClick={onClose}>&times;</button>
        
        <div className="badge-modal-badge-container">
          <div 
            className="badge-modal-icon-wrapper"
            style={{
              background: details.gradient
            }}
          >
            <span className="badge-modal-icon">{details.icon}</span>
          </div>
        </div>

        <h2 className="badge-modal-title">{badgeName}</h2>
        <div className="badge-modal-tag" style={{ color: details.color, border: `1px solid ${details.color}33` }}>
          UNLOCKED
        </div>

        <p className="badge-modal-description">{details.description}</p>
        
        <div className="badge-modal-requirements-box">
          <span className="requirements-label">Requirement:</span>
          <span className="requirements-text">{details.requirements}</span>
        </div>

        <div className="badge-modal-footer">
          <button className="badge-modal-share-btn" onClick={handleShare}>
            {copied ? "Copied! 🔗" : "Share Achievement 🚀"}
          </button>
        </div>
      </div>

      <style>{`
        .badge-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease-out;
        }

        .badge-modal-card {
          background: var(--card-glass-bg);
          border: 1px solid var(--card-glass-border);
          border-radius: 20px;
          padding: 30px;
          width: 380px;
          max-width: 90%;
          text-align: center;
          position: relative;
          backdrop-filter: blur(16px);
          box-shadow: var(--shadow);
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .badge-modal-close {
          position: absolute;
          top: 15px;
          right: 20px;
          background: transparent;
          border: none;
          color: var(--text);
          font-size: 28px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .badge-modal-close:hover {
          color: var(--text-h);
        }

        .badge-modal-badge-container {
          margin: 15px 0;
          display: flex;
          justify-content: center;
        }

        .badge-modal-icon-wrapper {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(0,0,0,0.15);
          animation: pulseGlow 2s infinite alternate;
        }

        .badge-modal-icon {
          font-size: 48px;
        }

        .badge-modal-title {
          font-size: 24px;
          font-weight: 700;
          margin: 15px 0 5px;
          color: var(--text-h);
        }

        .badge-modal-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          padding: 4px 10px;
          border-radius: 20px;
          margin-bottom: 20px;
          background: var(--subcard-bg);
        }

        .badge-modal-description {
          font-size: 14px;
          color: var(--text);
          line-height: 1.5;
          margin: 0 auto 20px;
        }

        .badge-modal-requirements-box {
          background: var(--subcard-bg);
          border: 1px solid var(--subcard-border);
          border-radius: 12px;
          padding: 12px;
          font-size: 13px;
          margin-bottom: 25px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .requirements-label {
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .requirements-text {
          color: var(--text-h);
          font-weight: 600;
        }

        .badge-modal-share-btn {
          width: 100%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          color: #fff;
          padding: 12px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .badge-modal-share-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes pulseGlow {
          from { transform: scale(1); }
          to { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default BadgeModal;
