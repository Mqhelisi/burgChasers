import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Categories from './pages/Categories';
import Sellers from './pages/Sellers';
import SellerPage from './pages/SellerPage';
import ProductPage from './pages/ProductPage';
import Profile from './pages/Profile';
import SellerSignup from './pages/SellerSignup';
import SellerDashboard from './pages/SellerDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* <Route path="/seller-signup" element={<SellerSignup />} /> */}
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/sellers" element={<Sellers />} />
            <Route path="/seller/:sellerId" element={<SellerPage />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
