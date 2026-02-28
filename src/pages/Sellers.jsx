import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
// import { db } from '../database';
import { useState, useEffect } from 'react';
import { api } from '../api';


const Sellers = () => {
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    api('/api/sellers')
   .then(response => {
        // Check if the request was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the JSON data from the response body
      })
      .then(data => {
        console.log('Fetched data:', data.sellers); // Console log the response data
        setSellers(data.sellers); // Store data in state if needed for rendering
      })
      .catch(error => {
        console.error('Error fetching data:', error); // Handle any errors
      });
  }, []); // The empty array ensures this effect runs only once when the component mounts
   
   
   
    // .then(res => res.json())
    // // .then(setSellers(res.json().sellers))
    // .then(console.log(res))
    // }, []);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-dark-900 mb-4">
            Top <span className="gradient-text">Sellers</span>
          </h1>
          <p className="text-xl text-dark-600 max-w-2xl mx-auto">
            Meet our verified sellers with the best products and ratings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sellers.map((seller, index) => (
            <motion.div
              key={seller.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/seller/${seller.id}`}>
                <motion.div
                  className="glass-effect rounded-2xl overflow-hidden card-hover cursor-pointer"
                  whileHover={{ y: -8 }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={seller.banner}
                      alt={seller.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={seller.avatar}
                          alt={seller.name}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-white"
                        />
                        <div>
                          <h3 className="text-white font-bold text-xl flex items-center">
                            {seller.name}
                            {seller.verified && <span className="ml-2 text-blue-400">✓</span>}
                          </h3>
                          <div className="flex items-center space-x-2 text-white/90 text-sm">
                            <span className="flex items-center">
                              <span className="text-yellow-400 mr-1">★</span>
                              {seller.rating}
                            </span>
                            <span>•</span>
                            <span>{seller.totalSales} sales</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                        {seller.category}
                      </span>
                    </div>
                    <p className="text-dark-700 mb-4">{seller.description}</p>
                    <motion.button
                      className="w-full btn-primary"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Visit Store
                    </motion.button>
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

export default Sellers;
