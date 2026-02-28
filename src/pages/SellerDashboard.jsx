import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useLocation } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

const SellerDashboard = () => {
  const { user, isAuthenticated, updateUserProfile } = useAuth();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    images: [],
  });
  const [imagePreview, setImagePreview] = useState([]);
  const [message, setMessage] = useState(location.state?.message || '');
  const [verificationRequested, setVerificationRequested] = useState(false);

  const MAX_PRODUCTS = user?.productLimit || 5;
  const MAX_IMAGES_PER_PRODUCT = 5;

  useEffect(() => {
    if (user && user.role === 'seller') {
      fetchProducts();
      setVerificationRequested(user.verificationRequested);
    }
  }, [user]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchProducts = async () => {
    try {
      const response = await apiCall(`/seller_prods/${user.sellerId}`, {
        method: 'GET'
      });
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }; 

  const handleVerificationRequest = async () => {
    try {
      const response = await apiCall('/sellers/request-verification', { method: 'POST' });
      const data = await response.json();
      if (response.ok && data.success) {
        setVerificationRequested(true);
        setMessage('Verification requested! Admin will review your account soon.');
        if (updateUserProfile) updateUserProfile({ verificationRequested: true });
      } else {
        setMessage(data.message || 'Failed to request verification');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.images.length + files.length > MAX_IMAGES_PER_PRODUCT) {
      setMessage(`Maximum ${MAX_IMAGES_PER_PRODUCT} images allowed per product`);
      return;
    }

    const newImages = [];
    const newPreviews = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result);
        newPreviews.push(reader.result);
        
        if (newImages.length === files.length) {
          setFormData({
            ...formData,
            images: [...formData.images, ...newImages]
          });
          setImagePreview([...imagePreview, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreview(newPreviews);
  };
const { apiCall } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (products.length >= MAX_PRODUCTS && !editingProduct) {
      setMessage(`Product limit reached (${MAX_PRODUCTS}). ${!user.verified ? 'Request verification to unlock 15 products.' : ''}`);
      return;
    }

    if (formData.images.length === 0) {
      setMessage('Please add at least one image');
      return;
    }

    // const token = localStorage.getItem('token');
    // const url = editingProduct 
    //   ? `http://localhost:5000/api/products/${editingProduct.id}`
    //   : 'http://localhost:5000/api/products';
    
    // const method = editingProduct ? 'PUT' : 'POST';
   setError('');
    setSuccess('');
try {
      const response = await apiCall('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          images: formData.images
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Product created successfully!');
        setFormData({ name: '', price: '', description: '', images: [] });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to create product');
    }


// const createProduct = async () => {
//   const response = await apiCall('/products', {
//     method: 'POST',
//     body: JSON.stringify({
//       name: 'New Product',
//       price: 99.99,
//       description: 'Product description',
//       images: ['url1', 'url2']
//     })
//   });

//   const data = await response.json();
//   if (data.success) {
//     console.log('Product created:', data.product);
//   }
// };

    // try {
    //   console.log(formData);
    //   const response = await fetch('http://localhost:5000/api/products', {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${token}`,
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //      name: formData.name,
    //      price: formData.price,
    //       description: formData.description,
    //       // images: formData.images
    //     })
    //   });

    //   const data = await response.json();

    //   if (response.ok && data.success) {
    //     await fetchProducts();
    //     setFormData({ name: '', price: '', description: '', images: [] });
    //     setImagePreview([]);
    //     setShowAddProduct(false);
    //     setEditingProduct(null);
    //     setMessage(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
    //   } else {
    //     setMessage(data.message || 'Operation failed');
    //   }
    // } catch (error) {
    //   setMessage('Network error. Please try again.');
    // }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || '',
      images: product.images || [],
    });
    setImagePreview(product.images || []);
    setShowAddProduct(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await apiCall(`/products/${productId}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchProducts();
        setMessage('Product deleted successfully');
      }
    } catch (error) {
      setMessage('Failed to delete product');
    }
  };

  const cancelEdit = () => {
    setFormData({ name: '', price: '', description: '', images: [] });
    setImagePreview([]);
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  if (!isAuthenticated || user.role !== 'seller') {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success/Info Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-primary-500/10 border border-primary-500/30 text-primary-300 px-6 py-4 rounded-xl"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-dark-100 mb-2">Seller Dashboard</h1>
              <p className="text-dark-300">Welcome back, {user.name}!</p>
            </div>
            <div className="mt-4 lg:mt-0 text-right">
              <div className="text-3xl font-bold gradient-text">{products.length}/{MAX_PRODUCTS}</div>
              <div className="text-dark-400 text-sm">Products Listed</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-dark-800/50 rounded-xl p-6">
              <div className="text-2xl font-bold text-primary-400 mb-2">
                {user.category}
              </div>
              <div className="text-dark-400">Your Category</div>
            </div>

            <div className="bg-dark-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-accent-400">
                  {user.verified ? 'Verified ✓' : 'Unverified'}
                </div>
              </div>
              <div className="text-dark-400">Account Status</div>
              {!user.verified && (
                <div className="text-xs text-primary-400 mt-2">
                  {MAX_PRODUCTS} product limit
                </div>
              )}
            </div>

            <div className="bg-dark-800/50 rounded-xl p-6">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {user.totalSales || 0}
              </div>
              <div className="text-dark-400">Total Sales</div>
            </div>
          </div>

          {/* Verification Button */}
          {!user.verified && !verificationRequested && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-xl p-6 border border-primary-500/30"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold text-dark-100 mb-2">
                    🚀 Want to post more products?
                  </h3>
                  <p className="text-dark-300">
                    Get verified to unlock 15 products (currently limited to 5)
                  </p>
                </div>
                <motion.button
                  onClick={handleVerificationRequest}
                  className="btn-primary whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Request Verification
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Verification Requested Notice */}
          {!user.verified && verificationRequested && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-accent-500/10 rounded-xl p-6 border border-accent-500/30"
            >
              <div className="flex items-start">
                <span className="text-3xl mr-4">⏳</span>
                <div>
                  <h3 className="text-lg font-bold text-dark-100 mb-2">
                    Verification Requested
                  </h3>
                  <p className="text-dark-300 mb-2">
                    Your request is being reviewed by our admin team. You'll receive an email once approved.
                  </p>
                  <p className="text-dark-400 text-sm">
                    Current limit: {MAX_PRODUCTS} products • After verification: 15 products
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Add Product Button */}
        {!showAddProduct && products.length < MAX_PRODUCTS && (
          <motion.button
            onClick={() => setShowAddProduct(true)}
            className="btn-primary mb-8"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + Add New Product
          </motion.button>
        )}

        {/* Product Limit Warning */}
        {products.length >= MAX_PRODUCTS && !showAddProduct && (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 text-red-300 px-6 py-4 rounded-xl">
            ⚠️ Product limit reached ({MAX_PRODUCTS} products). 
            {!user.verified && ' Request verification to post up to 15 products.'}
          </div>
        )}

        {/* Add/Edit Product Form */}
        <AnimatePresence>
          {showAddProduct && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-effect rounded-2xl p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-dark-100 mb-6">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-dark-200 font-medium mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-dark-200 font-medium mb-2">Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-dark-200 font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field min-h-[100px]"
                    placeholder="Describe your product..."
                  />
                </div>

                <div>
                  <label className="block text-dark-200 font-medium mb-2">
                    Product Images ({formData.images.length}/{MAX_IMAGES_PER_PRODUCT}) *
                  </label>
                  
                  {formData.images.length < MAX_IMAGES_PER_PRODUCT && (
                    <div className="mb-4">
                      <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-dark-700 rounded-xl hover:border-primary-500 cursor-pointer transition-colors bg-dark-800/50">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📸</div>
                          <div className="text-dark-300">Click to upload images</div>
                          <div className="text-dark-500 text-sm">
                            ({MAX_IMAGES_PER_PRODUCT - formData.images.length} remaining)
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {imagePreview.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {imagePreview.map((img, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <img
                            src={img}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                              Main
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <motion.button
                    type="button"
                    onClick={cancelEdit}
                    className="btn-secondary flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="btn-primary flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products List */}
        <div>
          <h2 className="text-2xl font-bold text-dark-100 mb-6">Your Products</h2>
          
          {products.length === 0 ? (
            <div className="glass-effect rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-dark-200 mb-2">No products yet</h3>
              <p className="text-dark-400">Start by adding your first product!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-effect rounded-2xl overflow-hidden"
                >
                  <div className="relative h-48">
                    <img
                      src={product.images?.[0] || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.images && product.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-dark-900/80 text-white px-2 py-1 rounded text-sm">
                        +{product.images.length - 1} photos
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg text-dark-100 mb-2">{product.name}</h3>
                    <div className="text-2xl font-bold text-primary-400 mb-4">
                      ${product.price}
                    </div>

                    <div className="flex items-center justify-between text-sm text-dark-400 mb-4">
                      <span>⭐ {product.rating || 0}</span>
                      <span>{product.votes || 0} votes</span>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleEdit(product)}
                        className="flex-1 bg-dark-800 text-primary-400 border border-primary-600 px-4 py-2 rounded-lg hover:bg-dark-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 bg-red-500/10 text-red-400 border border-red-500 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
