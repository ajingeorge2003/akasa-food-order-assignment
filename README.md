# 🍕 Food Ordering Platform

A full-stack food ordering application built with **Node.js/Express** backend and **React** frontend.

## 📋 Features

✅ **User Authentication** - Register & login with email/password using JWT  
✅ **Browse Products** - Filter items by category (All, Fruit, Vegetable, Non-veg, Breads, etc.)  
✅ **Shopping Cart** - Add/remove items, update quantities, persistent across devices  
✅ **Checkout** - Stock validation, atomic transactions, order creation with Order ID  
✅ **Order History** - Track all orders with delivery status  
✅ **Security** - Password hashing (bcrypt), JWT tokens, CORS, Helmet middleware  

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account with connection string
- npm

### Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file** in `backend/` folder with:
   ```
   MONGO_URI=mongodb+srv://admin:Akasa%40123@foodorder.cmrwrxj.mongodb.net/?appName=foodOrder
   JWT_SECRET=your-long-random-secret-key-min-32-chars-change-this-in-production
   PORT=5000
   NODE_ENV=development
   ```

4. **Seed sample data** (optional - creates 4 products and test user):
   ```bash
   npm run seed
   ```
   - Test user: `test@example.com` / `password123`

5. **Start backend server:**
   ```bash
   npm run start
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Open new terminal, navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products?category=All` - List products by category
- `GET /api/products/:id` - Get product details
- `POST /api/products/seed` - Seed sample data (dev only)

### Cart (Protected)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update item quantity
- `DELETE /api/cart/:productId` - Remove item

### Orders (Protected)
- `POST /api/orders/checkout` - Place order
- `GET /api/orders` - Get order history
- `GET /api/orders/:id` - Get order details

---

## 🗄️ Database Schema

### User
```
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  cart: [{
    product: ObjectId (ref: Product),
    qty: Number
  }],
  createdAt, updatedAt
}
```

### Product
```
{
  _id: ObjectId,
  name: String,
  category: String (indexed),
  description: String,
  price: Number,
  stock: Number,
  createdAt, updatedAt
}
```

### Order
```
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId,
    name: String,
    price: Number,
    qty: Number
  }],
  total: Number,
  status: String (pending/delivered),
  orderId: String (unique UUID),
  createdAt, updatedAt
}
```

---

## 🔒 Security Features

- **Password Hashing**: bcryptjs (10 salt rounds)
- **JWT Authentication**: 7-day token expiry
- **CORS**: Enabled for frontend communication
- **Helmet**: Security headers
- **Rate Limiting**: 200 requests per minute
- **Input Validation**: Error handling on all routes
- **Protected Routes**: Cart and Order endpoints require authentication

---

## 📁 Project Structure

```
akasa-assignment/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   └── orders.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── config/
│   │   └── db.js
│   ├── data/
│   │   └── seed.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── README.md
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AuthTab.tsx
    │   │   ├── ProductsTab.tsx
    │   │   ├── CartTab.tsx
    │   │   └── OrdersTab.tsx
    │   ├── api.ts
    │   ├── App.tsx
    │   ├── App.css
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

---

## 💡 How to Use

### 1. Register/Login
- Enter email and password to create an account or login
- JWT token is stored in localStorage for persistence

### 2. Browse Products
- Select category from dropdown (All, Fruit, Vegetable, Non-veg, Breads)
- View product details (name, price, stock, description)
- Out-of-stock items are disabled

### 3. Add to Cart
- Enter quantity and click "Add to Cart"
- Same item adds to existing quantity
- Cart persists across browser restarts and devices

### 4. Checkout
- Click "🛒 Cart" tab to view cart items
- Update quantities or remove items
- Click "Proceed to Checkout"
- System validates stock availability
- On success: Order ID and confirmation are shown

### 5. View Orders
- Click "Orders" tab to see order history
- Each order shows: Order ID, date, items, total, status
- Status: Pending (⏳) or Delivered (✅)

---

## 🔧 Development

### Environment Variables

**Backend (.env):**
```
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret-key>
PORT=5000
NODE_ENV=development
```

**Frontend (hardcoded in api.ts):**
```
API_BASE = http://localhost:5000/api
```

### Running Tests

**Backend seed (create sample data):**
```bash
cd backend
npm run seed
```

**Frontend dev mode (with hot reload):**
```bash
cd frontend
npm run dev
```

---

## 📦 Dependencies

### Backend
- express@^5.1.0
- mongoose@^8.19.3
- bcryptjs@^2.4.3
- jsonwebtoken@^9.0.0
- cors@^2.8.5
- helmet@^7.0.0
- express-rate-limit@^6.7.0
- express-async-handler@^1.2.0
- uuid@^9.0.0
- dotenv@^17.2.3

### Frontend
- react@^19.1.1
- react-dom@^19.1.1
- vite@^7.1.7
- typescript@~5.9.3

---

## 🚀 Deployment

### Backend (Node.js/Express)
Options:
- Heroku, Railway, Render, AWS EC2, DigitalOcean, Azure App Service

### Frontend (React)
Options:
- Vercel, Netlify, GitHub Pages, Azure Static Web Apps

### Database
- MongoDB Atlas (cloud-hosted, already configured)

---

## ⚠️ Important Notes

1. **Cart Persistence**: Saved to user document in DB, available across devices
2. **Checkout Transaction**: Stock is deducted atomically using MongoDB transactions
3. **Stock Validation**: Done before checkout; insufficient items are reported
4. **Multiple Logins**: One account can be logged in from multiple devices/browsers
5. **Order Status**: Manually updated to "delivered" (currently all orders are "pending")
6. **Taxes & Discounts**: Ignored per requirements

---

## 🐛 Troubleshooting

### Backend won't start
- Check `.env` file exists with `MONGO_URI` and `JWT_SECRET`
- Verify MongoDB connection string is correct
- Ensure port 5000 is not in use: `netstat -ano | findstr :5000` (Windows)

### Frontend can't connect to backend
- Ensure backend is running on `http://localhost:5000`
- Check CORS is enabled (it is by default)
- Verify `API_BASE` in `src/api.ts` matches backend URL

### Cart not persisting
- Clear browser cache and localStorage
- Re-login to fetch fresh cart from server
- Check browser console for API errors

### MongoDB connection fails
- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas (add your IP or 0.0.0.0 for all)
- Ensure credentials (username/password) are correct

---

## 👨‍💻 Author Notes

This is a clean, minimal implementation focusing on:
- ✅ Clear separation of concerns (backend business logic, frontend UI)
- ✅ Simple and maintainable code
- ✅ All requirements met without overcomplication
- ✅ Production-ready security practices
- ✅ Easy to extend and scale

For improvements given more time:
- Add email verification for registration
- Implement order status automation (delivery tracking)
- Add product images and search functionality
- Implement payment gateway integration
- Add admin dashboard for order management
- Add unit and integration tests
- Implement caching for product listings

---

## 📄 License

ISC
