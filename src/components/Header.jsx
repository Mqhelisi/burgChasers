import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass-effect"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-2xl font-bold gradient-text">Marketplace</span>
            </motion.div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/">
              <motion.span 
                className="text-dark-200 hover:text-primary-400 font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Home
              </motion.span>
            </Link>
            <Link to="/categories">
              <motion.span 
                className="text-dark-200 hover:text-primary-400 font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Categories
              </motion.span>
            </Link>
            <Link to="/sellers">
              <motion.span 
                className="text-dark-200 hover:text-primary-400 font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Top Sellers
              </motion.span>
            </Link>
            {user && user.role === 'seller' && (
              <Link to="/seller-dashboard">
                <motion.span 
                  className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Dashboard
                </motion.span>
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors border border-dark-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-dark-100">{user.name}</span>
                  <span className={`px-2 py-1 text-white text-xs rounded-full ${
                    user.role === 'seller' ? 'bg-primary-600' : 'bg-accent-600'
                  }`}>
                    {user.role}
                  </span>
                </motion.button>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-64 glass-effect rounded-xl shadow-2xl p-4"
                  >
                    <div className="mb-3 pb-3 border-b border-dark-700">
                      <p className="font-semibold text-dark-100">{user.name}</p>
                      <p className="text-sm text-dark-400">{user.email}</p>
                      {user.role === 'buyer' && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-dark-400">
                            Total Purchases: <span className="font-semibold text-dark-200">{user.totalPurchases || 0}</span>
                          </p>
                          <p className="text-xs text-dark-400">
                            User Weight: <span className="font-semibold text-primary-400">{user.userWeight?.toFixed(1)}x</span>
                          </p>
                        </div>
                      )}
                      {user.role === 'seller' && (
                        <div className="mt-2">
                          <p className="text-xs text-dark-400">
                            Category: <span className="font-semibold text-dark-200">{user.category}</span>
                          </p>
                        </div>
                      )}
                    </div>
                    {user.role === 'seller' ? (
                      <Link to="/seller-dashboard">
                        <motion.button
                          className="w-full text-left px-3 py-2 hover:bg-primary-500/10 rounded-lg transition-colors text-dark-200"
                          whileHover={{ x: 5 }}
                          onClick={() => setShowUserMenu(false)}
                        >
                          Dashboard
                        </motion.button>
                      </Link>
                    ) : (
                      <Link to="/profile">
                        <motion.button
                          className="w-full text-left px-3 py-2 hover:bg-primary-500/10 rounded-lg transition-colors text-dark-200"
                          whileHover={{ x: 5 }}
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Profile
                        </motion.button>
                      </Link>
                    )}
                    <motion.button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors mt-1"
                      whileHover={{ x: 5 }}
                    >
                      Logout
                    </motion.button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <motion.button
                    className="btn-secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Login
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
