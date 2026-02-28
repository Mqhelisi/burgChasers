import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../database';
import { useAuth } from '../AuthContext';
import { api } from '../api';

const ProductPage = () => {
  const { productId } = useParams();
  const { user, isAuthenticated, isBuyer } = useAuth();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [selectedRating, setSelectedRating] = useState(0);
  const [showVoteSuccess, setShowVoteSuccess] = useState(false);

  // useEffect(() => {
  //   const productData = db.getProducts().find(p => p.id === productId);
  //   if (productData) {
  //     setProduct(productData);
  //     const sellerData = db.getSellerById(productData.sellerId);
  //     setSeller(sellerData);
  //     const reviewData = db.getReviewsByProduct(productId);
  //     setReviews(reviewData);
  //   }
  // }, [productId]);

 useEffect(() => {
    (async () => {
      try {
        const response = await api(`/api/products/${productId}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        setProduct(data.product);

        const sellerRes = await api(`/api/sellers/${data.product.sellerId}`);
        if (sellerRes.ok) {
          const sdata = await sellerRes.json();
          setSeller(sdata.seller);
        }

        const reviewsRes = await api(`/api/reviews/${data.product.id}`);
        if (reviewsRes.ok) {
          const rdata = await reviewsRes.json();
          setReviews(rdata.reviews);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    })();
  }, [productId]); // Update when productId changes
   


  const handleVote = (rating) => {
    if (!isAuthenticated) {
      alert('Please login to vote');
      return;
    }

    const result = db.addVote(productId, user.id, rating);
    if (result.success) {
      setShowVoteSuccess(true);
      setTimeout(() => setShowVoteSuccess(false), 3000);
      // Refresh product data
      const updatedProduct = db.getProducts().find(p => p.id === productId);
      setProduct(updatedProduct);
    } else {
      alert(result.message);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to review');
      return;
    }

    db.addReview(productId, user.id, newReview);
    const reviewData = db.getReviewsByProduct(productId);
    setReviews(reviewData);
    setNewReview({ rating: 5, comment: '' });
  };

  if (!product || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-dark-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Product Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-effect rounded-2xl overflow-hidden"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-4">
              <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-dark-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                <span className="text-yellow-500 text-2xl">★</span>
                <span className="text-2xl font-bold ml-2">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-dark-500">({product.votes} votes)</span>
            </div>

            <div className="text-5xl font-bold text-primary-600 mb-8">
              ${product.price}
            </div>

            {/* Seller Info */}
            <Link to={`/seller/${seller.id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass-effect rounded-xl p-4 mb-6 cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={seller.avatar}
                    alt={seller.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm text-dark-600">Sold by</p>
                    <p className="font-bold text-dark-900">{seller.name}</p>
                  </div>
                </div>
              </motion.div>
            </Link>

            <motion.button
              className="btn-primary w-full text-lg mb-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Contact Seller
            </motion.button>
          </motion.div>
        </div>

        {/* Voting Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-effect rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-dark-900 mb-6">Rate This Product</h2>
          
          {showVoteSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6"
            >
              ✓ Your vote has been recorded! {isBuyer && `(${user.userWeight}x weight applied)`}
            </motion.div>
          )}

          <div className="flex items-center space-x-4 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setSelectedRating(star);
                  handleVote(star);
                }}
                className="text-5xl focus:outline-none"
              >
                <span className={selectedRating >= star ? 'text-yellow-500' : 'text-dark-300'}>
                  ★
                </span>
              </motion.button>
            ))}
          </div>
          
          {!isAuthenticated && (
            <p className="text-dark-600">
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                Login
              </Link>{' '}
              to vote on this product
            </p>
          )}

          {isBuyer && isAuthenticated && (
            <p className="text-accent-600 font-semibold">
              Your vote counts {user.userWeight}x more as a registered buyer!
            </p>
          )}
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-effect rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-dark-900 mb-6">
            Reviews ({reviews.length})
          </h2>

          {/* Add Review Form */}
          {isAuthenticated && (
            <form onSubmit={handleReviewSubmit} className="mb-8 pb-8 border-b border-dark-200">
              <div className="mb-4">
                <label className="block text-dark-700 font-medium mb-2">Your Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="text-3xl focus:outline-none"
                    >
                      <span className={newReview.rating >= star ? 'text-yellow-500' : 'text-dark-300'}>
                        ★
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-dark-700 font-medium mb-2">Your Review</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="input-field min-h-[120px]"
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>

              <motion.button
                type="submit"
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Submit Review
              </motion.button>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-dark-600 text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-dark-50 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-dark-900">{review.userName}</p>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${i < review.rating ? 'text-yellow-500' : 'text-dark-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-dark-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-dark-700">{review.comment}</p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductPage;
