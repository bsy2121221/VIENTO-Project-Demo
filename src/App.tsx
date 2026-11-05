import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastProvider } from '@/context/ToastContext'
import { StoreProvider } from '@/context/StoreContext'
import { CartProvider } from '@/context/CartContext'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import StoreLayout, { ScrollToTop } from '@/components/layout/StoreLayout'
import AdminLayout, { RequireAdmin } from '@/components/layout/AdminLayout'
import HomePage from '@/pages/store/HomePage'
import ProductsPage from '@/pages/store/ProductsPage'
import ProductDetailPage from '@/pages/store/ProductDetailPage'
import CartPage from '@/pages/store/CartPage'
import CheckoutPage from '@/pages/store/CheckoutPage'
import OrderConfirmationPage from '@/pages/store/OrderConfirmationPage'
import { MyOrdersPage, OrderTrackingPage, TrackOrderPage } from '@/pages/store/OrdersPages'
import { NotFoundPage, PolicyPage } from '@/pages/store/MiscPages'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import DashboardPage from '@/pages/admin/DashboardPage'
import ProductsAdminPage from '@/pages/admin/ProductsAdminPage'
import InventoryPage from '@/pages/admin/InventoryPage'
import { OrderDetailAdminPage, OrdersAdminPage } from '@/pages/admin/OrdersAdminPages'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <StoreProvider>
          <CartProvider>
            <AdminAuthProvider>
              <ScrollToTop />
              <Routes>
                <Route element={<StoreLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="products/:slug" element={<ProductDetailPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
                  <Route path="orders" element={<MyOrdersPage />} />
                  <Route path="orders/:orderNumber" element={<OrderTrackingPage />} />
                  <Route path="track" element={<TrackOrderPage />} />
                  <Route path="policies/:slug" element={<PolicyPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
                <Route path="admin/login" element={<AdminLoginPage />} />
                <Route
                  path="admin"
                  element={
                    <RequireAdmin>
                      <AdminLayout />
                    </RequireAdmin>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="products" element={<ProductsAdminPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="orders" element={<OrdersAdminPage />} />
                  <Route path="orders/:id" element={<OrderDetailAdminPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </AdminAuthProvider>
          </CartProvider>
        </StoreProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
