import { useState, useEffect } from 'react'
import { orders } from '../api'

interface OrdersTabProps {
  token: string
}

interface Order {
  _id: string
  orderId: string
  total: number
  status: string
  items: Array<{ name: string; price: number; qty: number }>
  createdAt: string
}

export default function OrdersTab({ token }: OrdersTabProps) {
  const [orderList, setOrderList] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await orders.list(token)
      setOrderList(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="orders-container">
      {error && <div className="error">{error}</div>}

      {loading ? (
        <p>Loading orders...</p>
      ) : orderList.length === 0 ? (
        <p className="no-orders">No orders yet</p>
      ) : (
        <div className="orders-list">
          {orderList.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <strong>Order #</strong> {order.orderId.slice(-6).toUpperCase()}
                </div>
                <div className={`order-status ${order.status}`}>
                  {order.status === 'delivered' ? '✅ Delivered' : '⏳ Pending'}
                </div>
              </div>
              <div className="order-date">
                {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
              </div>
              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <span>{item.name} × {item.qty}</span>
                    <span>₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <strong>Total: ₹{order.total}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
