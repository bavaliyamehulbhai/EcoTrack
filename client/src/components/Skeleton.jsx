import React from "react";

export function Skeleton({ width = "100%", height = "20px", borderRadius = "8px", margin = "0" }) {
  return (
    <div
      className="skeleton-pulse"
      style={{
        width,
        height,
        borderRadius,
        margin,
        background: "linear-gradient(90deg, rgba(255, 255, 255, 0.03) 25%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.03) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeletonShimmer 1.6s infinite linear"
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      className="welcome-card"
      style={{
        padding: "24px",
        marginBottom: "0",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        background: "rgba(255, 255, 255, 0.02)",
        borderColor: "rgba(255, 255, 255, 0.04)"
      }}
    >
      <Skeleton width="40px" height="40px" borderRadius="50%" />
      <Skeleton width="60%" height="18px" />
      <Skeleton width="90%" height="14px" />
      <Skeleton width="40%" height="12px" />
    </div>
  );
}

export function SkeletonTable({ rows = 4, cols = 5 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={`${100 / cols}%`} height="16px" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: "flex", gap: "12px" }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} width={`${100 / cols}%`} height="14px" />
          ))}
        </div>
      ))}
    </div>
  );
}
