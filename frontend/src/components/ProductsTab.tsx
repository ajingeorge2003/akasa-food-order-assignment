import { useState, useEffect } from 'react'
import { products, cart } from '../api'
import Toast from './Toast.tsx'

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
  image?: string
}

export default function ProductsTab({ token, onCartUpdate }: ProductsTabProps) {
  const [productList, setProductList] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; productId?: string } | null>(null)
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [lastAddedItem, setLastAddedItem] = useState<{ productId: string; qty: number } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

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
      setLastAddedItem({ productId: product._id, qty })
      setToast({ message: `Added ${qty}x ${product.name} to cart!`, type: 'success', productId: product._id })
      setQuantities({ ...quantities, [product._id]: 1 })
      const cartItems = await cart.get(token)
      onCartUpdate(cartItems.length)
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' })
    }
  }

  const handleUndoAdd = async () => {
    if (!lastAddedItem) return
    try {
      await cart.remove(lastAddedItem.productId, token)
      setLastAddedItem(null)
      const cartItems = await cart.get(token)
      onCartUpdate(cartItems.length)
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Filter products by category and search query
  const filteredProducts = productList.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
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
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <p>Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <p>No products found</p>
      ) : (
        <>
          {/* Products Grid */}
          <div className="products-grid">
            {paginatedProducts.map((product) => (
              <div key={product._id} className="product-card">
                {product.image && (
                  <img 
                    src={product.image + "?w=400&h=200&fit=crop"} 
                    alt={product.name} 
                    className="product-image"
                    loading="lazy"
                  />
                )}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn prev-btn"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageClick(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                className="pagination-btn next-btn"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>

              <div className="pagination-info">
                <span>Page {currentPage} of {totalPages}</span>
                <span className="product-count">({filteredProducts.length} products)</span>
              </div>
            </div>
          )}
        </>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onUndo={toast.type === 'success' ? handleUndoAdd : undefined}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
