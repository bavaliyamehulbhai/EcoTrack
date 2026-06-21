import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg)',
          color: 'var(--text-h)',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>Oops!</h1>
          <p style={{ fontSize: '18px', color: 'var(--text)', marginBottom: '24px' }}>Something went wrong while loading the application.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
