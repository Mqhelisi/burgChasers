import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../database';
import { api } from '../api';

const SellerPage = () => {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // const sellerData = db.(sellerId);
    // const productData = db.getProductsBySeller(sellerId);
    // setSeller(sellerData);
    // setProducts(productData);
    api(`/api/seller_prods/${sellerId}`)
   
     .then(response => {
        // Check if the request was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the JSON data from the response body
      })
      .then(data => {
        console.log('Fetched data:', data.products); // Console log the response data
        setProducts(data.products); // Store data in state if needed for rendering
      
  api(`/api/sellers/${sellerId}`)
   
  .then(response => {
        // Check if the request was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the JSON data from the response body
      })
      .then(data => {
        console.log('Fetched data:', data.seller); // Console log the response data
        setSeller(data.seller); // St   
      })
      
      })
      .catch(error => {
        console.error('Error fetching data:', error); // Handle any errors
      })
  }, []);

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-dark-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Banner Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-80 overflow-hidden"
      >
        <img
          src={seller.banner}
          alt={seller.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto flex items-end space-x-6">
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              src={seller.avatar}
              alt={seller.name}
              className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-2xl"
            />
            <div className="flex-1 pb-2">
              <motion.h1
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-4xl font-bold text-white mb-2 flex items-center"
              >
                {seller.name}
                {seller.verified && (
                  <span className="ml-3 text-blue-400 text-2xl">✓</span>
                )}
              </motion.h1>
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center space-x-4 text-white/90"
              >
                <span className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span className="font-semibold">{seller.rating}</span>
                </span>
                <span>•</span>
                <span>{seller.totalSales} Sales</span>
                <span>•</span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                  {seller.category}
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-dark-900 mb-4">About {seller.name}</h2>
          <p className="text-dark-700 text-lg leading-relaxed">{seller.description}</p>
          <div className="mt-6 flex items-center space-x-4">
            <a
              href={`mailto:${seller.email}`}
              className="btn-primary"
            >
              Contact Seller
            </a>
          </div>
        </motion.div>

        {/* Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-dark-900 mb-8">
            Products Gallery
            <span className="text-dark-500 text-xl ml-3">({products.length})</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link to={`/product/${product.id}`}>
                  <motion.div
                    className="glass-effect rounded-2xl overflow-hidden card-hover cursor-pointer"
                    whileHover={{ y: -8 }}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <motion.img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold ml-1">{product.rating}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-dark-900 mb-2">{product.name}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary-600">
                          ${product.price}
                        </span>
                        <span className="text-sm text-dark-500">{product.votes} votes</span>
                      </div>
                      <motion.button
                        className="w-full mt-4 btn-primary text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        View Details
                      </motion.button>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SellerPage;
