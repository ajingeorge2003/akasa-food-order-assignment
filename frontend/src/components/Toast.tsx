import { useState, useEffect } from 'react'
import '../styles/Toast.css'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onUndo?: () => void
  onClose: () => void
}

export default function Toast({ message, type = 'success', duration = 3000, onUndo, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleUndo = () => {
    onUndo?.()
    setIsExiting(true)
    setTimeout(onClose, 300)
  }

  return (
    <div className={`toast toast-${type} ${isExiting ? 'toast-exit' : ''}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'success' && '✅'}
          {type === 'error' && '❌'}
          {type === 'info' && 'ℹ️'}
        </span>
        <span className="toast-message">{message}</span>
        {onUndo && (
          <button className="toast-undo-btn" onClick={handleUndo}>
            UNDO
          </button>
        )}
      </div>
      <div className="toast-progress">
        <div className="toast-progress-bar" style={{ animationDuration: `${duration}ms` }}></div>
      </div>
    </div>
  )
}
