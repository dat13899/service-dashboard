import { Component } from 'react';

/** Error boundary — catches render errors, shows fallback UI.
 *  Wrap each page or section to prevent full white screen on crash.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex items-center justify-center" style={{ minHeight: '60dvh', padding: '2rem' }}>
          <div className="glass-panel p-xl text-center" style={{ maxWidth: '450px' }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '2rem', color: 'var(--amber)', marginBottom: '0.75rem' }} />
            <h3 className="text-lg font-semibold text-strong mb-sm">
              {this.props.fallbackTitle || 'Có lỗi xảy ra'}
            </h3>
            <p className="text-sm text-dim mb-lg">
              {this.props.fallbackMessage || 'Vui lòng thử tải lại trang.'}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                this.setState({ error: null, errorInfo: null });
                if (this.props.onRetry) this.props.onRetry();
              }}
            >
              <i className="fas fa-redo" /> Thử lại
            </button>
            {this.props.showDetails && (
              <details className="mt-lg text-left" style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                <summary className="cursor-pointer">Chi tiết lỗi</summary>
                <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
