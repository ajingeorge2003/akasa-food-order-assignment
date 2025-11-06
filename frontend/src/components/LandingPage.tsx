import { useState } from 'react'
import '../styles/LandingPage.css'

interface LandingPageProps {
  onGetStarted: () => void
  onNavigateToPhase?: (phase: string) => void
  isLoggedIn?: boolean
  onLogout?: () => void
  isDarkMode?: boolean
  onToggleDarkMode?: () => void
}

export default function LandingPage({ 
  onGetStarted, 
  onNavigateToPhase, 
  isLoggedIn = false,
  onLogout,
  isDarkMode = false,
  onToggleDarkMode
}: LandingPageProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleFeatureClick = (phase: string) => {
    if (isLoggedIn && onNavigateToPhase) {
      onNavigateToPhase(phase)
    } else {
      onGetStarted()
    }
  }

  return (
    <div className={`landing-page ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Top Bar */}
      <header className="landing-header">
        <div className="header-left">
          <h1 className="header-logo">🍽️ Eato</h1>
        </div>
        <div className="header-right">
          <button 
            className="dark-mode-toggle"
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          {isLoggedIn && (
            <div className="user-menu">
              <button 
                className="user-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                👤 Account
              </button>
              {showDropdown && (
                <div className="dropdown-menu">
                  <button className="logout-btn" onClick={() => {
                    onLogout?.()
                    setShowDropdown(false)
                  }}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Welcome to <span className="brand">Eato</span></h1>
            <p className="hero-subtitle">
              Order your favorite food from the comfort of your home
            </p>
            <p className="hero-description">
              Discover delicious meals from top restaurants, browse through our extensive menu, 
              add items to your cart, and get them delivered hot to your doorstep.
            </p>
            {!isLoggedIn && (
              <button className="cta-button" onClick={onGetStarted}>
                Get Started 🍕
              </button>
            )}
          </div>
          <div className="hero-emoji">
            <span className="emoji-lg">🍕</span>
            <span className="emoji-sm">🍔</span>
            <span className="emoji-md">🍜</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div 
            className="feature-card"
            onClick={() => handleFeatureClick('products')}
            style={{ cursor: 'pointer' }}
          >
            <div className="feature-icon">🔍</div>
            <h3>Browse Menu</h3>
            <p>Browse through hundreds of delicious food items by category</p>
            {isLoggedIn && <span className="card-hint">Click to browse →</span>}
          </div>
          <div 
            className="feature-card"
            onClick={() => handleFeatureClick('cart')}
            style={{ cursor: 'pointer' }}
          >
            <div className="feature-icon">🛒</div>
            <h3>Smart Cart</h3>
            <p>Add items to cart, manage quantities, and review before checkout</p>
            {isLoggedIn && <span className="card-hint">Click to view cart →</span>}
          </div>
          <div 
            className="feature-card"
            onClick={() => handleFeatureClick('products')}
            style={{ cursor: 'pointer' }}
          >
            <div className="feature-icon">💳</div>
            <h3>Easy Checkout</h3>
            <p>Secure and fast checkout process with real-time order tracking</p>
            {isLoggedIn && <span className="card-hint">Click to order →</span>}
          </div>
          <div 
            className="feature-card"
            onClick={() => handleFeatureClick('orders')}
            style={{ cursor: 'pointer' }}
          >
            <div className="feature-icon">⚡</div>
            <h3>Track Delivery</h3>
            <p>Track your order status from confirmation to delivery</p>
            {isLoggedIn && <span className="card-hint">Click to track →</span>}
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Secure</h3>
            <p>Your data is protected with industry-standard security measures</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">😊</div>
            <h3>Great Deals</h3>
            <p>Enjoy regular promotions and exclusive offers on your favorites</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Sign Up / Login</h3>
              <p>Create an account or login with your credentials</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Browse & Select</h3>
              <p>Explore restaurants and pick your favorite dishes</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Add to Cart</h3>
              <p>Add items to your cart and adjust quantities</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Checkout</h3>
              <p>Review and place your order instantly</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h3>Track & Enjoy</h3>
              <p>Track your order and enjoy your meal!</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Order?</h2>
          <p>Join thousands of happy customers enjoying delicious food delivered to their homes</p>
          {!isLoggedIn && (
            <button className="cta-button-large" onClick={onGetStarted}>
              Start Ordering Now 🚀
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2025 Eato - The Food Ordering App. All rights reserved.</p>
        <p>Delivering happiness, one meal at a time</p>
      </footer>
    </div>
  )
}
