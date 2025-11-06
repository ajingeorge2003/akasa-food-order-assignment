import { useState, useEffect } from 'react'
import { auth } from '../api'

interface ResetPasswordPageProps {
  token: string | null
  onResetSuccess: () => void
  onBackToLogin: () => void
}

export default function ResetPasswordPage({ token, onResetSuccess, onBackToLogin }: ResetPasswordPageProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      if (!token) {
        throw new Error('Reset token is missing')
      }

      const result = await auth.resetPassword(token, newPassword)
      setSuccess(true)
      setNewPassword('')
      setConfirmPassword('')

      // Store token and redirect after 2 seconds
      setTimeout(() => {
        localStorage.setItem('token', result.token)
        onResetSuccess()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Reset Password
        </h1>

        {success ? (
          <div className="text-center">
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <p className="font-semibold">✓ Password reset successful!</p>
              <p className="text-sm mt-2">Redirecting you to the app...</p>
            </div>
          </div>
        ) : (
          <>
            {!token ? (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="font-semibold">{error}</p>
                <button
                  onClick={onBackToLogin}
                  className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded transition-colors"
                >
                  Request New Reset Link
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* New Password Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="flex items-center border-b-2 border-gray-300 focus-within:border-pink-400 transition-colors">
                    <span className="text-gray-400 mr-3">🔒</span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="flex-1 py-2 outline-none text-gray-700 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="flex items-center border-b-2 border-gray-300 focus-within:border-pink-400 transition-colors">
                    <span className="text-gray-400 mr-3">🔒</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="flex-1 py-2 outline-none text-gray-700 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-400 to-pink-500 text-white font-bold py-2 rounded-full hover:shadow-lg transition-shadow disabled:opacity-70"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            {/* Back to Login Link */}
            {token && (
              <div className="mt-6 text-center">
                <button
                  onClick={onBackToLogin}
                  className="text-pink-500 font-semibold hover:underline transition-colors"
                >
                  Back to Login
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
