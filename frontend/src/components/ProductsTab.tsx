import { useState, useEffect } from 'react'
import { products, cart } from '../api'

interface ProductsTabProps {
  token: string
  onCartUpdate: (count: number) => void
}

interface Product {
  _id: string
  name: string
  category: string
  price: number
  stock: number
  description?: string
}

export default function ProductsTab({ token, onCartUpdate }: ProductsTabProps) {
  const [productList, setProductList] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  useEffect(() => {
    const timer = setTimeout(() => setSuccessMsg(''), 3000)
    return () => clearTimeout(timer)
  }, [successMsg])

  const fetchProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const cats = await products.getCategories()
      setCategories(cats as string[])
      const prods = await products.list(selectedCategory)
      setProductList(prods)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product: Product) => {
    const qty = quantities[product._id] || 1
    try {
      await cart.add(product._id, qty, token)
      setSuccessMsg(`Added ${product.name} to cart!`)
      setQuantities({ ...quantities, [product._id]: 1 })
      const cartItems = await cart.get(token)
      onCartUpdate(cartItems.length)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="products-container">
      <div className="category-filter">
        <label>Category:</label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error">{error}</div>}
      {successMsg && <div className="success">{successMsg}</div>}

      {loading ? (
        <p>Loading products...</p>
      ) : productList.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div className="products-grid">
          {productList.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-header">
                <h3>{product.name}</h3>
                <span className="category-badge">{product.category}</span>
              </div>
              {product.description && <p className="description">{product.description}</p>}
              <div className="product-details">
                <div className="price">₹{product.price}</div>
                <div className="stock">
                  {product.stock > 0 ? (
                    <span className="in-stock">Stock: {product.stock}</span>
                  ) : (
                    <span className="out-of-stock">Out of Stock</span>
                  )}
                </div>
              </div>
              <div className="product-actions">
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantities[product._id] || 1}
                  onChange={(e) =>
                    setQuantities({
                      ...quantities,
                      [product._id]: parseInt(e.target.value) || 1,
                    })
                  }
                  disabled={product.stock === 0}
                />
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className="add-btn"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
