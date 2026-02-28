import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { Navigate } from 'react-router-dom';
import { db } from '../database';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const userVotes = db.getVotes().filter(v => v.userId === user.id);
  const userReviews = db.getReviews().filter(r => r.userId === user.id);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-4xl">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-dark-900">{user.name}</h1>
              <p className="text-dark-600">{user.email}</p>
              <div className="mt-2">
                <span className="px-3 py-1 bg-primary-500 text-white text-sm rounded-full">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {user.totalPurchases || 0}
              </div>
              <div className="text-dark-700 font-medium">Total Purchases</div>
            </div>

            <div className="bg-accent-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-accent-600 mb-2">
                ${(user.totalSpent || 0).toFixed(2)}
              </div>
              <div className="text-dark-700 font-medium">Total Spent</div>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {user.userWeight?.toFixed(1)}x
              </div>
              <div className="text-dark-700 font-medium">Vote Weight</div>
            </div>
          </div>
        </motion.div>

        {/* Activity Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-2xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-dark-900 mb-6">Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-primary-500 pl-4">
              <div className="text-2xl font-bold text-dark-900 mb-1">{userVotes.length}</div>
              <div className="text-dark-600">Products Voted</div>
            </div>
            <div className="border-l-4 border-accent-500 pl-4">
              <div className="text-2xl font-bold text-dark-900 mb-1">{userReviews.length}</div>
              <div className="text-dark-600">Reviews Written</div>
            </div>
          </div>
        </motion.div>

        {/* User Benefits */}
        {user.role === 'buyer' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-effect rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-dark-900 mb-6">Buyer Benefits</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <h3 className="font-semibold text-dark-900">Enhanced Voting Power</h3>
                  <p className="text-dark-600">Your votes count {user.userWeight}x more than regular viewers</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-dark-900">Purchase Tracking</h3>
                  <p className="text-dark-600">Keep track of all your purchases and spending</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="font-semibold text-dark-900">Weight Increases</h3>
                  <p className="text-dark-600">Your vote weight increases with each purchase (max 3.0x)</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
