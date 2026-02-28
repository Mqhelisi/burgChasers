import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';
import { db } from '../database';

const categories = [
  { id: 'apparel', name: 'Apparel', icon: '👕', color: 'from-pink-500 to-rose-500' },
  { id: 'electronics', name: 'Electronics', icon: '📱', color: 'from-blue-500 to-cyan-500' },
  { id: 'haircare', name: 'Haircare', icon: '💇', color: 'from-purple-500 to-pink-500' },
  { id: 'services', name: 'Services', icon: '🛠️', color: 'from-green-500 to-emerald-500' },
];

const CategorySection = () => {
  const [selectedCategory, setSelectedCategory] = useState('Electronics');
  const [topProducts, setTopProducts] = useState([]);
  const [topSellers, setTopSellers] = useState([]);

  // useEffect(() => {
  //   const products = db.getTopProductsByCategory(selectedCategory, 6);
  //   const sellers = db.getTopSellersByCategory(selectedCategory, 3);
  //   setTopProducts(products);
  //   setTopSellers(sellers);
  //   console.log(topSellers)
  // }, [selectedCategory]);

 useEffect(() => {
   api('/api/products')
  .then(response => {
        // Check if the request was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the JSON data from the response body
      })
      .then(data => {
        console.log('Fetched data:', data.products); // Console log the response data
        setTopProducts(data.products.filter(product => product.category === selectedCategory)); // Store data in state if needed for rendering
    
    
        api('/api/sellers')
        .then(
          response => {
        // Check if the request was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the JSON data from the response body
      }
        ).then(Sdata => {
        console.log('Fetched seller Sdata:', Sdata.sellers); // Console log the response Sdata
          setTopSellers(Sdata.sellers)
       
        })
      })
      .catch(error => {
        console.error('Error fetching data:', error); // Handle any errors
      });
  }, [selectedCategory]); // The empty array ensures this effect runs only once when the component mounts
   


  return (
    <section className="py-20 bg-gradient-to-b from-white to-dark-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-dark-900 mb-4">
            Top Trending by <span className="gradient-text">Category</span>
          </h2>
          <p className="text-xl text-dark-600 max-w-2xl mx-auto">
            Discover the best products and sellers in each category
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                selectedCategory === category.name
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                  : 'bg-white text-dark-700 hover:shadow-md'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Top Sellers */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-dark-900 mb-6">Top Sellers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topSellers.map((seller, index) => (
              <motion.div
                key={seller.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/seller/${seller.id}`}>
                  <motion.div
                    className="glass-effect rounded-2xl p-6 card-hover cursor-pointer"
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={seller.avatar}
                        alt={seller.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-primary-200"
                      />
                      <div>
                        <h4 className="font-bold text-lg text-dark-900 flex items-center">
                          {seller.name}
                          {seller.verified && (
                            <span className="ml-2 text-blue-500">✓</span>
                          )}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-yellow-500">★</span>
                          <span className="font-semibold">{seller.rating}</span>
                          <span className="text-dark-500">({seller.totalSales} sales)</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-dark-600 text-sm">{seller.description}</p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-dark-900 mb-6">Trending Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
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
                      <h4 className="font-bold text-lg text-dark-900 mb-2">{product.name}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary-600">
                          ${product.price}
                        </span>
                        <span className="text-sm text-dark-500">{product.votes} votes</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CategorySection;
