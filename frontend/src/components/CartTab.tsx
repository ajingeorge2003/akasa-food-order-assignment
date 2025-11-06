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

export default function CartTab({ token, onCheckoutSuccess, onCartUpdate }: CartTabProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const [orderResult, setOrderResult] = useState<any>(null)

  useEffect(() => {
    fetchCart()
  }, [])

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
    if (newQty <= 0) {
      await handleRemove(productId)
      return
    }
    try {
      await cart.update(productId, newQty, token)
      fetchCart()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleRemove = async (productId: string) => {
    try {
      await cart.remove(productId, token)
      fetchCart()
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
    try {
      const result = await orders.checkout(token)
      setOrderResult(result.order)
      setCartItems([])
      onCartUpdate(0)
      setSuccessMsg('Order placed successfully!')
      setTimeout(() => onCheckoutSuccess(), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCheckingOut(false)
    }
  }

  if (orderResult) {
    return (
      <div className="checkout-success">
        <h2>✅ Order Placed!</h2>
        <div className="order-details">
          <p><strong>Order ID:</strong> {orderResult.orderId}</p>
          <p><strong>Total:</strong> ₹{orderResult.total}</p>
          <p><strong>Status:</strong> {orderResult.status}</p>
          <p className="items-count">Items: {orderResult.items.length}</p>
        </div>
      </div>
    )
  }

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0)

  return (
    <div className="cart-container">
      {error && <div className="error">{error}</div>}
      {successMsg && <div className="success">{successMsg}</div>}

      {loading ? (
        <p>Loading cart...</p>
      ) : cartItems.length === 0 ? (
        <p className="empty-cart">Cart is empty</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.product._id} className="cart-item">
                <div className="item-info">
                  <h4>{item.product.name}</h4>
                  <p className="price">₹{item.product.price}</p>
                </div>
                <div className="item-qty">
                  <button onClick={() => handleUpdateQty(item.product._id, item.qty - 1)}>-</button>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) =>
                      handleUpdateQty(item.product._id, parseInt(e.target.value) || 1)
                    }
                  />
                  <button onClick={() => handleUpdateQty(item.product._id, item.qty + 1)}>+</button>
                </div>
                <div className="item-total">
                  <p>₹{item.product.price * item.qty}</p>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => handleRemove(item.product._id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{total}</span>
            </div>
            <div className="summary-total">
              <span>Total:</span>
              <span className="amount">₹{total}</span>
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
