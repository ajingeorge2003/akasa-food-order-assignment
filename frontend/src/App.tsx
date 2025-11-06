import { useState, useEffect } from 'react'
import './App.css'
import LandingPage from './components/LandingPage'
import AuthTab from './components/AuthTab'
import ProductsTab from './components/ProductsTab'
import CartTab from './components/CartTab'
import OrdersTab from './components/OrdersTab'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [activeTab, setActiveTab] = useState('products')
  const [cartCount, setCartCount] = useState(0)
  const [showLanding, setShowLanding] = useState(!token)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode')
    return saved ? JSON.parse(saved) : false
  })

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
      <header className="header">
        <h1 className="logo" onClick={handleLogoClick} style={{ cursor: token ? 'pointer' : 'default' }}>
          🍽️ Eato - The Food Ordering App
        </h1>
        <div className="header-controls">
          <button 
            className="dark-mode-toggle"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          {token && <button className="logout-btn" onClick={handleLogout}>Logout</button>}
        </div>
      </header>

      {!token ? (
        <AuthTab onLoginSuccess={setToken} />
      ) : (
        <div className="tabs">
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              🔍 Browse
            </button>
            <button
              className={`tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => setActiveTab('cart')}
            >
              🛒 Cart ({cartCount})
            </button>
            <button
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 Orders
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
