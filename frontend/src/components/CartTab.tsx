import { useState, useEffect } from 'react'
import { cart, orders } from '../api'

interface CartTabProps {
  token: string
  onCheckoutSuccess: () => void
  onCartUpdate: (count: number) => void
}

interface CartItem {
  product: {
    _id: string
    name: string
    price: number
  }
  qty: number
}

interface CartItemRowProps {
  item: CartItem
  onUpdateQty: (productId: string, qty: number) => Promise<void>
  onRemove: (productId: string) => Promise<void>
}

// Isolated cart item component - only re-renders when its props change
const CartItemRow = ({ item, onUpdateQty, onRemove }: CartItemRowProps) => {
  const [localQty, setLocalQty] = useState(item.qty)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleQtyChange = async (newQty: number) => {
    if (newQty <= 0) {
      setIsUpdating(true)
      try {
        await onRemove(item.product._id)
      } finally {
        setIsUpdating(false)
      }
      return
    }
    setLocalQty(newQty)
    setIsUpdating(true)
    try {
      await onUpdateQty(item.product._id, newQty)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="cart-item">
      <div className="item-info">
        <h4>{item.product.name}</h4>
        <p className="price">₹{item.product.price}</p>
      </div>
      <div className="item-qty">
        <button 
          onClick={() => handleQtyChange(localQty - 1)}
          disabled={isUpdating}
          className="qty-btn"
        >
          −
        </button>
        <input
          type="number"
          min="1"
          max="999"
          value={localQty}
          onChange={(e) => {
            const val = Math.max(1, parseInt(e.target.value) || 1)
            setLocalQty(val)
          }}
          onBlur={() => handleQtyChange(localQty)}
          disabled={isUpdating}
          className="qty-input"
        />
        <button 
          onClick={() => handleQtyChange(localQty + 1)}
          disabled={isUpdating}
          className="qty-btn"
        >
          +
        </button>
      </div>
      <div className="item-total">
        <p>₹{(item.product.price * localQty).toFixed(2)}</p>
      </div>
      <button
        className="remove-btn"
        onClick={() => onRemove(item.product._id)}
        disabled={isUpdating}
      >
        Remove
      </button>
    </div>
  )
}

export default function CartTab({ token, onCheckoutSuccess, onCartUpdate }: CartTabProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const [orderResult, setOrderResult] = useState<any>(null)
  const [insufficientItems, setInsufficientItems] = useState<any[]>([])

  useEffect(() => {
    fetchCart()
  }, [token])

  useEffect(() => {
    const timer = setTimeout(() => setSuccessMsg(''), 3000)
    return () => clearTimeout(timer)
  }, [successMsg])

  const fetchCart = async () => {
    setLoading(true)
    setError('')
    try {
      const items = await cart.get(token)
      setCartItems(items)
      onCartUpdate(items.length)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQty = async (productId: string, newQty: number) => {
    try {
      await cart.update(productId, newQty, token)
      // Update local state optimistically
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product._id === productId ? { ...item, qty: newQty } : item
        )
      )
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleRemove = async (productId: string) => {
    try {
      await cart.remove(productId, token)
      // Remove from local state optimistically
      setCartItems(prevItems => prevItems.filter(item => item.product._id !== productId))
      onCartUpdate(cartItems.length - 1)
      setSuccessMsg('Item removed from cart')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setError('Cart is empty')
      return
    }
    setCheckingOut(true)
    setError('')
    setInsufficientItems([])
    try {
      const result = await orders.checkout(token)
      setOrderResult(result.order)
      setCartItems([])
      onCartUpdate(0)
      setSuccessMsg('Order placed successfully!')
      setTimeout(() => onCheckoutSuccess(), 2000)
    } catch (err: any) {
      // Check if error has insufficient items data
      if (err.data?.insufficient) {
        setInsufficientItems(err.data.insufficient)
      }
      setError(err.message)
    } finally {
      setCheckingOut(false)
    }
  }

  if (orderResult) {
    return (
      <div className="checkout-success">
        <h2>Order Placed!</h2>
        <div className="order-details">
          <p><strong>Order ID:</strong> {orderResult.orderId.slice(-6).toUpperCase()}</p>
          <p><strong>Total:</strong> ₹{orderResult.total.toFixed(2)}</p>
          <p><strong>Status:</strong> {orderResult.status}</p>
          <p className="items-count">Items: {orderResult.items.length}</p>
        </div>
      </div>
    )
  }

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0)

  return (
    <div className="cart-container">
      {error && (
        <div className="error-section">
          <div className="error">{error}</div>
          {insufficientItems.length > 0 && (
            <div className="insufficient-items-alert">
              <h4>Items with Insufficient Stock:</h4>
              <ul>
                {insufficientItems.map((item: any) => (
                  <li key={item.product}>
                    <strong>{item.name}</strong>: Requested {item.requested}, but only {item.available} available
                  </li>
                ))}
              </ul>
              <p className="alert-info">Please reduce the quantity of these items and try again.</p>
            </div>
          )}
        </div>
      )}
      {successMsg && <div className="success">{successMsg}</div>}

      {loading ? (
        <p>Loading cart...</p>
      ) : cartItems.length === 0 ? (
        <p className="empty-cart">Your cart is empty</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <CartItemRow
                key={item.product._id}
                item={item}
                onUpdateQty={handleUpdateQty}
                onRemove={handleRemove}
              />
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="summary-total">
              <span>Total:</span>
              <span className="amount">₹{total.toFixed(2)}</span>
            </div>
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={checkingOut || cartItems.length === 0}
            >
              {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
