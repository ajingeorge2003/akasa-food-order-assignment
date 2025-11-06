import { useState } from 'react'
import '../styles/TopBar.css'

interface TopBarProps {
  isDarkMode: boolean
  onToggleDarkMode: () => void
  isLoggedIn: boolean
  onLogout?: () => void
  onLogoClick?: () => void
}

export default function TopBar({
  isDarkMode,
  onToggleDarkMode,
  isLoggedIn,
  onLogout,
  onLogoClick
}: TopBarProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    onLogout?.()
    setShowDropdown(false)
  }

  return (
    <header className={`topbar ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="topbar-left">
        <h1 
          className="topbar-logo"
          onClick={onLogoClick}
          style={{ cursor: onLogoClick ? 'pointer' : 'default' }}
          title="Click to go to home"
        >
          🍽️ Eato
        </h1>
      </div>

      <div className="topbar-center">
        <p className="app-tagline">The Food Ordering App</p>
      </div>

      <div className="topbar-right">
        <button
          className="dark-mode-toggle"
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {isLoggedIn && (
          <div className="user-menu">
            <button
              className="user-btn"
              onClick={() => setShowDropdown(!showDropdown)}
              aria-label="User menu"
            >
              👤 Account
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <button
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
