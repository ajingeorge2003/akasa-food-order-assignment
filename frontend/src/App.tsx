import { useState, useEffect } from 'react'
import './App.css'
import LandingPage from './components/LandingPage.tsx'
import AuthTab from './components/AuthTab.tsx'
import ResetPasswordPage from './components/ResetPasswordPage.tsx'
import ProductsTab from './components/ProductsTab.tsx'
import CartTab from './components/CartTab.tsx'
import OrdersTab from './components/OrdersTab.tsx'
import TopBar from './components/TopBar.tsx'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [activeTab, setActiveTab] = useState('products')
  const [cartCount, setCartCount] = useState(0)
  const [showLanding, setShowLanding] = useState(!token)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode')
    return saved ? JSON.parse(saved) : false
  })
  const [resetToken, setResetToken] = useState<string | null>(null)

  // Check for reset token in URL
  useEffect(() => {
    const path = window.location.pathname
    const match = path.match(/\/reset-password\/(.+)/)
    if (match && match[1]) {
      setResetToken(match[1])
    }
  }, [])

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode))
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }, [isDarkMode])

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('token')
    setActiveTab('products')
    setShowLanding(true)
  }

  const handleGetStarted = () => {
    setShowLanding(false)
  }

  const handleLogoClick = () => {
    if (token) {
      setShowLanding(true)
    }
  }

  const handleNavigateToPhase = (phase: string) => {
    setShowLanding(false)
    setActiveTab(phase)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Show reset password page if reset token is present
  if (resetToken) {
    return (
      <ResetPasswordPage 
        token={resetToken} 
        onResetSuccess={() => {
          setResetToken(null)
          setToken(localStorage.getItem('token'))
          setShowLanding(true)
        }}
        onBackToLogin={() => {
          setResetToken(null)
          window.history.pushState({}, '', '/')
        }}
      />
    )
  }

  if (showLanding && !token) {
    return <LandingPage 
      onGetStarted={handleGetStarted}
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
    />
  }

  if (showLanding && token) {
    return <LandingPage 
      onGetStarted={() => setShowLanding(false)} 
      onNavigateToPhase={handleNavigateToPhase} 
      isLoggedIn={true}
      onLogout={handleLogout}
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
    />
  }

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
      <TopBar
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        isLoggedIn={!!token}
        onLogout={handleLogout}
        onLogoClick={token ? handleLogoClick : undefined}
      />

      {!token ? (
        <AuthTab onLoginSuccess={setToken} />
      ) : (
        <div className="tabs">
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Browse
            </button>
            <button
              className={`tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => setActiveTab('cart')}
            >
              Cart ({cartCount})
            </button>
            <button
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'products' && (
              <ProductsTab token={token} onCartUpdate={setCartCount} />
            )}
            {activeTab === 'cart' && (
              <CartTab token={token} onCheckoutSuccess={() => setActiveTab('orders')} onCartUpdate={setCartCount} />
            )}
            {activeTab === 'orders' && (
              <OrdersTab token={token} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
