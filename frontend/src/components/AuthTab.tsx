import { useState } from 'react'
import { auth } from '../api'

interface AuthTabProps {
  onLoginSuccess: (token: string) => void
}

export default function AuthTab({ onLoginSuccess }: AuthTabProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = isLogin
        ? await auth.login(email, password)
        : await auth.register(email, password)
      onLoginSuccess(result.token)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResetMessage('')
    setResetLoading(true)

    try {
      await auth.requestPasswordReset(resetEmail)
      setResetMessage('Password reset link has been sent to your email. Please check your inbox.')
      setResetEmail('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        {!isForgotPassword ? (
          <>
            <h2>{isLogin ? 'Login' : 'Register'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {isLogin && (
                <div className="text-right mb-4">
                  <button
                    type="button"
                    className="link-btn text-sm"
                    onClick={() => {
                      setIsForgotPassword(true)
                      setError('')
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              {error && <div className="error">{error}</div>}
              <button type="submit" disabled={loading}>
                {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
              </button>
            </form>
            <p>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                className="link-btn"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                }}
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </>
        ) : (
          <>
            <h2>Reset Password</h2>
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              {error && <div className="error">{error}</div>}
              {resetMessage && <div className="success">{resetMessage}</div>}
              <button type="submit" disabled={resetLoading}>
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p>
              <button
                className="link-btn"
                onClick={() => {
                  setIsForgotPassword(false)
                  setError('')
                  setResetMessage('')
                }}
              >
                Back to Login
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
