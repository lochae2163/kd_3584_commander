import React from 'react';
import { withTranslation } from 'react-i18next';

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
    const { t } = this.props;

    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          background: '#1a1a2e',
          minHeight: '100vh',
          color: '#fff',
          fontFamily: 'system-ui'
        }}>
          <h1 style={{ color: '#e94560' }}>{t('common:errors.somethingWentWrong')}</h1>
          <p style={{ color: '#94a3b8' }}>{t('common:errors.tryRefreshing')}</p>
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
            {t('common:buttons.goToDashboard')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
