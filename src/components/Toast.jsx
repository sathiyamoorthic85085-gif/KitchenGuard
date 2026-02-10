import { useEffect } from 'react'

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration)
            return () => clearTimeout(timer)
        }
    }, [duration, onClose])

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    }

    const colors = {
        success: 'var(--success)',
        error: 'var(--danger)',
        warning: 'var(--warning)',
        info: 'var(--secondary)'
    }

    return (
        <div style={{
            background: 'var(--bg-card)',
            border: `1px solid ${colors[type]}`,
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            minWidth: '300px',
            maxWidth: '500px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(16px)',
            animation: 'slideIn 0.3s ease-out'
        }}>
            <span style={{ fontSize: '1.5rem' }}>{icons[type]}</span>
            <p style={{ margin: 0, flex: 1, color: 'var(--text-main)' }}>{message}</p>
            <button
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    padding: 0,
                    lineHeight: 1
                }}
            >
                ×
            </button>
        </div>
    )
}
