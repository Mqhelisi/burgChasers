import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const categories = [
  { id: 'apparel', name: 'Apparel', icon: '👕', description: 'Fashion, clothing & accessories' },
  { id: 'electronics', name: 'Electronics', icon: '📱', description: 'Gadgets, devices & tech' },
  { id: 'haircare', name: 'Haircare', icon: '💇', description: 'Hair products & styling tools' },
  { id: 'services', name: 'Services', icon: '🛠️', description: 'Professional services' },
];

const SellerSignup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    category: '',
    description: '',
    phone: '',
    website: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { registerSeller } = useAuth();

  const handleCategorySelect = (categoryName) => {
    setFormData({ ...formData, category: categoryName });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const data = await registerSeller(formData);

      if (data && data.success) {
        // registerSeller already stores token via AuthContext
        navigate('/seller-dashboard', { 
          state: { 
            message: 'Account created successfully! You can post up to 5 products. Request verification to unlock 15 products.',
            newAccount: true 
          } 
        });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-dark-100 mb-4">
            Become a <span className="gradient-text">Seller</span>
          </h1>
          <p className="text-dark-300 text-lg">
            Start selling immediately! Verification optional for more products.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-400'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-20 h-1 ${
                  step > s ? 'bg-primary-600' : 'bg-dark-800'
                }`} />
              )}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-dark-100 mb-6">Personal Information</h2>
                
                <div>
                  <label className="block text-dark-200 font-medium mb-2">Your Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-dark-200 font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-dark-200 font-medium mb-2">Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-field"
                      placeholder="Create a secure password"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-primary w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Next Step
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Business Information */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-dark-100 mb-6">Business Information</h2>
                
                <div>
                  <label className="block text-dark-200 font-medium mb-2">Business Name *</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="input-field"
                    placeholder="Your Store Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-dark-200 font-medium mb-2">Category *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((category) => (
                      <motion.div
                        key={category.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCategorySelect(category.name)}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.category === category.name
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-dark-700 hover:border-primary-600/50 bg-dark-800/50'
                        }`}
                      >
                        <div className="text-4xl mb-3">{category.icon}</div>
                        <h3 className="font-bold text-xl text-dark-100 mb-2">{category.name}</h3>
                        <p className="text-dark-400 text-sm">{category.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!formData.category}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: formData.category ? 1.02 : 1 }}
                    whileTap={{ scale: formData.category ? 0.98 : 1 }}
                  >
                    Next Step
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Additional Details */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-dark-100 mb-6">Store Details</h2>

                <div>
                  <label className="block text-dark-200 font-medium mb-2">Store Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field min-h-[120px]"
                    placeholder="Describe your business and products..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-dark-200 font-medium mb-2">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-dark-200 font-medium mb-2">Website (Optional)</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="input-field"
                      placeholder="https://yourstore.com"
                    />
                  </div>
                </div>

                <div className="bg-primary-500/10 rounded-xl p-6 border border-primary-500/30">
                  <h3 className="font-semibold text-dark-100 mb-3">🎉 You'll get instant access to:</h3>
                  <ul className="space-y-2 text-dark-300 text-sm">
                    <li className="flex items-center">
                      <span className="text-primary-400 mr-2">✓</span>
                      Your own seller dashboard
                    </li>
                    <li className="flex items-center">
                      <span className="text-primary-400 mr-2">✓</span>
                      Upload up to 5 products immediately
                    </li>
                    <li className="flex items-center">
                      <span className="text-primary-400 mr-2">✓</span>
                      5 photos per product
                    </li>
                    <li className="flex items-center">
                      <span className="text-accent-400 mr-2">⭐</span>
                      Request verification for 15 products (optional)
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-secondary flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="btn-primary flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Create Seller Account
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>

        <div className="mt-6 text-center">
          <p className="text-dark-300">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerSignup;
