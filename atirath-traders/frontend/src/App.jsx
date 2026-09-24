// src/App.js
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Import Provider
import { ProductsProvider } from './context/ProductsContext';

// Components
import TopBar from './components/TopBar';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import BrandsPage from './pages/BrandsPage'
import BlogPage from './pages/BlogPage';
import BlogDetails from './pages/BlogDetails';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ServicesPage from './pages/ServicesPage';
import HelpCenter from './pages/HelpCenter';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import FAQ from './pages/FAQ';

import AdminLayout from './admin/AdminLayout';
import AdminRoute from './admin/AdminRoute';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminUsers from './admin/AdminUsers';

// Scroll to top helper
function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
}

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <ProductsProvider>
      <ScrollToTop />
      {!isAdminRoute && <TopBar />}
      {!isAdminRoute && <Header />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/product-details" element={<ProductDetails />} />
        <Route path="/brands" element={<BrandsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogDetails />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/support/help-center" element={<HelpCenter />} />
        <Route path="/support/terms" element={<TermsAndConditions />} />
        <Route path="/support/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/support/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/support/faq" element={<FAQ />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>

      {!isAdminRoute && <Footer />}
    </ProductsProvider>
  );
}

export default App;