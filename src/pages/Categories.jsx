import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';
import { db } from '../database';

const categories = ['Apparel', 'Electronics', 'Haircare', 'Services'];

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  // const [products] = useState(db.getProducts());
  // const [products] = Product.query.all()
  const [products, setProducts] = useState([])


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
        setProducts(data.products); // Store data in state if needed for rendering
      })
      .catch(error => {
        console.error('Error fetching data:', error); // Handle any errors
      });
  }, []); // The empty array ensures this effect runs only once when the component mounts
   


  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-dark-900 mb-4">
            Explore <span className="gradient-text">Categories</span>
          </h1>
          <p className="text-xl text-dark-600 max-w-2xl mx-auto">
            Find the perfect products across all categories
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {['All', ...categories].map((category, index) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                  : 'bg-white text-dark-700 hover:shadow-md'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/product/${product.id}`}>
                <motion.div
                  className="glass-effect rounded-2xl overflow-hidden card-hover cursor-pointer"
                  whileHover={{ y: -8 }}
                >
                  <div className="relative h-56 overflow-hidden">
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
                  <div className="p-5">
                    <p className="text-xs text-dark-500 mb-1">{product.category}</p>
                    <h3 className="font-bold text-lg text-dark-900 mb-2">{product.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary-600">
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
      </div>
    </div>
  );
};

export default Categories;
