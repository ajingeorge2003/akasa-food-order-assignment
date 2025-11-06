import { useState, useEffect } from 'react'
import './App.css'
import AuthTab from './components/AuthTab'
import ProductsTab from './components/ProductsTab'
import CartTab from './components/CartTab'
import OrdersTab from './components/OrdersTab'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [activeTab, setActiveTab] = useState('products')
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('token')
    setActiveTab('products')
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🍕 Food Ordering Platform</h1>
        {token && <button className="logout-btn" onClick={handleLogout}>Logout</button>}
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
              Products
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
