import { Component } from 'react'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo)
        this.setState({ error, errorInfo })
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
        window.location.href = '/'
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-main)',
                    padding: '2rem'
                }}>
                    <div style={{
                        maxWidth: '500px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--danger)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '2rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                        <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>
                            Something went wrong
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            The application encountered an unexpected error. Please try refreshing the page.
                        </p>
                        <button
                            onClick={this.handleReset}
                            style={{
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 2rem',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '1rem'
                            }}
                        >
                            Return to Dashboard
                        </button>
                        {import.meta.env.DEV && this.state.error && (
                            <details style={{ marginTop: '2rem', textAlign: 'left' }}>
                                <summary style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    Error Details
                                </summary>
                                <pre style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    background: 'var(--bg-hover)',
                                    borderRadius: 'var(--radius-md)',
                                    overflow: 'auto',
                                    fontSize: '0.85rem',
                                    color: 'var(--danger)'
                                }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
