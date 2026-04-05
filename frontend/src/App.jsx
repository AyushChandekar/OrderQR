import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'

// Admin pages
import Login from './pages/admin/Login'
import Signup from './pages/admin/Signup'
import Dashboard from './pages/admin/Dashboard'
import Orders from './pages/admin/Orders'
import MenuManage from './pages/admin/MenuManage'
import Tables from './pages/admin/Tables'

// Customer pages
import MenuPage from './pages/customer/MenuPage'
import CartPage from './pages/customer/CartPage'
import OrderConfirmation from './pages/customer/OrderConfirmation'

export default function App() {
  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/signup" element={<Signup />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="orders" replace />} />
        <Route path="orders" element={<Orders />} />
        <Route path="menu" element={<MenuManage />} />
        <Route path="tables" element={<Tables />} />
      </Route>

      {/* Customer Routes */}
      <Route path="/menu/:tableId" element={<MenuPage />} />
      <Route path="/cart/:tableId" element={<CartPage />} />
      <Route path="/order-confirmation" element={<OrderConfirmation />} />

      {/* Default */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
