import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { PrivateRoute, AdminRoute } from './components/ProtectedRoute';
import Layout from './components/layout/Layout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import GameDetailPage from './pages/GameDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import WishlistPage from './pages/WishlistPage';
import ReportsPage from './pages/ReportsPage';
import AdminGamesPage from './pages/admin/AdminGamesPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCompanyPage from './pages/admin/AdminCompanyPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <Toaster position="bottom-right" richColors closeButton />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/games/:id" element={<GameDetailPage />} />

            <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
            <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><OrderHistoryPage /></PrivateRoute>} />
            <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
            <Route path="/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />

            <Route path="/admin/games" element={<AdminRoute><AdminGamesPage /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
            <Route path="/admin/companies" element={<AdminRoute><AdminCompanyPage /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
