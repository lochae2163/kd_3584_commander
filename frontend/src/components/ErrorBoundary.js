import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          background: '#1a1a2e',
          minHeight: '100vh',
          color: '#fff',
          fontFamily: 'system-ui'
        }}>
          <h1 style={{ color: '#e94560' }}>Something went wrong</h1>
          <p style={{ color: '#94a3b8' }}>Please try refreshing the page or going back to the dashboard.</p>
          <pre style={{
            background: '#0f3460',
            padding: '1rem',
            borderRadius: '8px',
            overflow: 'auto',
            color: '#ff6b6b'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: '#e94560',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
