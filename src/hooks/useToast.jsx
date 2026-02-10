import { createContext, useContext, useState, useCallback } from 'react'
import Toast from '../components/Toast'

const ToastContext = createContext()

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type, duration }])
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
                {toasts.map((toast, index) => (
                    <div
                        key={toast.id}
                        style={{
                            marginBottom: index < toasts.length - 1 ? '1rem' : 0
                        }}
                    >
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            duration={toast.duration}
                            onClose={() => removeToast(toast.id)}
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}
