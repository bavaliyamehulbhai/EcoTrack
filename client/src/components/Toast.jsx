import { useState, useEffect } from "react";

let toastListeners = [];

export const toast = {
  success: (message) => {
    toastListeners.forEach((listener) => listener({ type: "success", message }));
  },
  error: (message) => {
    toastListeners.forEach((listener) => listener({ type: "error", message }));
  }
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (newToast) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { ...newToast, id }]);
      
      // Auto dismiss after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        pointerEvents: "none"
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            pointerEvents: "auto",
            padding: "14px 22px",
            borderRadius: "12px",
            background: t.type === "success" 
              ? "linear-gradient(135deg, rgba(22, 163, 74, 0.95), rgba(34, 197, 94, 0.95))" 
              : "linear-gradient(135deg, rgba(220, 38, 38, 0.95), rgba(239, 68, 68, 0.95))",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            minWidth: "240px",
            maxWidth: "360px"
          }}
        >
          <span style={{ fontSize: "16px" }}>{t.type === "success" ? "✨" : "⚠️"}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
