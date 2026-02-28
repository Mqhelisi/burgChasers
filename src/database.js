// Local Storage Database Utility
const DB_KEYS = {
  USERS: 'marketplace_users',
  SELLERS: 'marketplace_sellers',
  PRODUCTS: 'marketplace_products',
  REVIEWS: 'marketplace_reviews',
  VOTES: 'marketplace_votes',
  SELLER_APPLICATIONS: 'marketplace_seller_applications',
  CURRENT_USER: 'marketplace_current_user',
};

class LocalDatabase {
  constructor() {
    this.initializeDatabase();
  }

  initializeDatabase() {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.SELLERS)) {
      localStorage.setItem(DB_KEYS.SELLERS, JSON.stringify(this.getDefaultSellers()));
    }
    if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(this.getDefaultProducts()));
    }
    if (!localStorage.getItem(DB_KEYS.REVIEWS)) {
      localStorage.setItem(DB_KEYS.REVIEWS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.VOTES)) {
      localStorage.setItem(DB_KEYS.VOTES, JSON.stringify([]));
    }
  }

  getDefaultSellers() {
    return [
      {
        id: 'seller-1',
        name: 'Tech Haven',
        email: 'contact@techhaven.com',
        category: 'Electronics',
        rating: 4.8,
        totalSales: 1250,
        verified: true,
        description: 'Your one-stop shop for cutting-edge electronics and gadgets.',
        banner: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=400&fit=crop',
        avatar: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=200&fit=crop',
      },
      {
        id: 'seller-2',
        name: 'Style Studio',
        email: 'hello@stylestudio.com',
        category: 'Apparel',
        rating: 4.9,
        totalSales: 2100,
        verified: true,
        description: 'Premium fashion and accessories for the modern trendsetter.',
        banner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=400&fit=crop',
        avatar: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop',
      },
      {
        id: 'seller-3',
        name: 'Beauty Bliss',
        email: 'info@beautybliss.com',
        category: 'Haircare',
        rating: 4.7,
        totalSales: 890,
        verified: true,
        description: 'Professional haircare products for every hair type.',
        banner: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1200&h=400&fit=crop',
        avatar: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=200&h=200&fit=crop',
      },
      {
        id: 'seller-4',
        name: 'Pro Services',
        email: 'support@proservices.com',
        category: 'Services',
        rating: 4.6,
        totalSales: 450,
        verified: true,
        description: 'Expert professional services tailored to your needs.',
        banner: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&h=400&fit=crop',
        avatar: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&h=200&fit=crop',
      },
    ];
  }

  getDefaultProducts() {
    return [
      // Electronics
      { id: '1', sellerId: '1', name: 'Wireless Earbuds Pro', price: 129.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop', rating: 4.7, votes: 245 },
      { id: '2', sellerId: '1', name: 'Smart Watch Ultra', price: 399.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&h=500&fit=crop', rating: 4.8, votes: 312 },
      { id: '3', sellerId: '1', name: '4K Webcam HD', price: 89.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1597075933405-da42a56d4e46?w=500&h=500&fit=crop', rating: 4.6, votes: 189 },
      
      // Apparel
      { id: '4', sellerId: '2', name: 'Designer Leather Jacket', price: 249.99, category: 'Apparel', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop', rating: 4.9, votes: 421 },
      { id: '5', sellerId: '2', name: 'Premium Denim Jeans', price: 79.99, category: 'Apparel', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop', rating: 4.7, votes: 356 },
      { id: '6', sellerId: '2', name: 'Luxury Handbag', price: 189.99, category: 'Apparel', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=500&fit=crop', rating: 4.8, votes: 298 },
      
      // Haircare
      { id: '7', sellerId: '3', name: 'Professional Hair Dryer', price: 149.99, category: 'Haircare', image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&h=500&fit=crop', rating: 4.7, votes: 267 },
      { id: '8', sellerId: '3', name: 'Keratin Treatment Kit', price: 69.99, category: 'Haircare', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&h=500&fit=crop', rating: 4.6, votes: 198 },
      { id: '9', sellerId: '3', name: 'Styling Iron Pro', price: 99.99, category: 'Haircare', image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&h=500&fit=crop', rating: 4.8, votes: 234 },
      
      // Services
      { id: '10', sellerId: '4', name: 'Web Design Package', price: 499.99, category: 'Services', image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=500&h=500&fit=crop', rating: 4.9, votes: 145 },
      { id: '11', sellerId: '4', name: 'Business Consultation', price: 299.99, category: 'Services', image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=500&h=500&fit=crop', rating: 4.7, votes: 112 },
      { id: '12', sellerId: '4', name: 'Marketing Strategy', price: 599.99, category: 'Services', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=500&fit=crop', rating: 4.8, votes: 156 },
    ];
  }

// Seller Application Management

  createSellerApplication(applicationData) {
  const applications = this.getSellerApplications();
  const newApplication = {
    id: `app-${Date.now()}`,
    ...applicationData,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  applications.push(newApplication);
  localStorage.setItem(DB_KEYS.SELLER_APPLICATIONS, JSON.stringify(applications));
  return newApplication;
}

getSellerApplications() {
  return JSON.parse(localStorage.getItem(DB_KEYS.SELLER_APPLICATIONS) || '[]');
}

approveSellerApplication(applicationId) {
  const applications = this.getSellerApplications();
  const application = applications.find(app => app.id === applicationId);
  
  if (application) {
    // Create seller account
    const sellerId = `seller-${Date.now()}`;
    const newSeller = {
      id: sellerId,
      name: application.businessName,
      email: application.email,
      category: application.category,
      rating: 0,
      totalSales: 0,
      verified: true,
      description: application.description,
      banner: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop',
      avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(application.businessName) + '&size=200&background=795c84&color=fff',
    };

    // Add seller to sellers list
    const sellers = this.getSellers();
    sellers.push(newSeller);
    localStorage.setItem(DB_KEYS.SELLERS, JSON.stringify(sellers));

    // Create user account for seller
    const sellerUser = {
      id: `user-${Date.now()}`,
      name: application.ownerName,
      email: application.email,
      password: application.password,
      role: 'seller',
      sellerId: sellerId,
      category: application.category,
      verified: true,
      createdAt: new Date().toISOString(),
    };

    const users = this.getUsers();
    users.push(sellerUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));

    // Update application status
    application.status = 'approved';
    application.approvedAt = new Date().toISOString();
    localStorage.setItem(DB_KEYS.SELLER_APPLICATIONS, JSON.stringify(applications));

    return { seller: newSeller, user: sellerUser };
  }
  return null;
}

// Product Management with Images
addProduct(productData) {
  const products = this.getProducts();
  const newProduct = {
    id: `prod-${Date.now()}`,
    ...productData,
    rating: 0,
    votes: 0,
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
  return newProduct;
}

updateProduct(productId, updates) {
  const products = this.getProducts();
  const index = products.findIndex(p => p.id === productId);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    return products[index];
  }
  return null;
}

deleteProduct(productId) {
  const products = this.getProducts();
  const filtered = products.filter(p => p.id !== productId);
  localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(filtered));
  return true;
}

// Get products count for a seller
getSellerProductCount(sellerId) {
  const products = this.getProductsBySeller(sellerId);
  return products.length;
}


  // User Management
  createUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      totalPurchases: 0,
      totalSpent: 0,
      reviewCount: 0,
      userWeight: userData.role === 'buyer' ? 1.5 : 1.0, // Buyers have higher weight
    };
    users.push(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  getUsers() {
    return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
  }

  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find(user => user.email === email);
  }

  updateUser(userId, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
      return users[index];
    }
    return null;
  }

  // Session Management
  setCurrentUser(user) {
    localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  getCurrentUser() {
    const userStr = localStorage.getItem(DB_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  logout() {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
  }

  // Seller Management
  getSellers() {
    return JSON.parse(localStorage.getItem(DB_KEYS.SELLERS) || '[]');
  }

  getSellerById(id) {
    const sellers = this.getSellers();
    return sellers.find(seller => seller.id === id);
  }

  getTopSellersByCategory(category, limit = 5) {
    const sellers = this.getSellers();
    return sellers
      .filter(seller => seller.category === category)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // Product Management
  getProducts() {
    console.log(JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]'))
    return JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]');
  }

  getProductsBySeller(sellerId) {
    const products = this.getProducts();
    return products.filter(product => product.sellerId === sellerId);
  }

  getProductsByCategory(category) {
    const products = this.getProducts();
    return products.filter(product => product.category === category);
  }

  getTopProductsByCategory(category, limit = 6) {
    const products = this.getProductsByCategory(category);
    return products
      .sort((a, b) => b.votes - a.votes)
      .slice(0, limit);
  }

  // Voting System
  addVote(productId, userId, rating) {
    const votes = this.getVotes();
    const existingVote = votes.find(v => v.productId === productId && v.userId === userId);
    
    if (existingVote) {
      return { success: false, message: 'You have already voted for this product' };
    }

    const user = this.getCurrentUser();
    const weight = user && user.role === 'buyer' ? user.userWeight : 1.0;

    const newVote = {
      id: `vote-${Date.now()}`,
      productId,
      userId,
      rating,
      weight,
      createdAt: new Date().toISOString(),
    };

    votes.push(newVote);
    localStorage.setItem(DB_KEYS.VOTES, JSON.stringify(votes));

    // Update product votes
    this.updateProductVotes(productId);

    return { success: true, vote: newVote };
  }

  getVotes() {
    return JSON.parse(localStorage.getItem(DB_KEYS.VOTES) || '[]');
  }

  updateProductVotes(productId) {
    const votes = this.getVotes().filter(v => v.productId === productId);
    const products = this.getProducts();
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex !== -1) {
      const totalWeight = votes.reduce((sum, vote) => sum + vote.weight, 0);
      const weightedRating = votes.reduce((sum, vote) => sum + (vote.rating * vote.weight), 0) / totalWeight;
      
      products[productIndex].votes = votes.length;
      products[productIndex].rating = weightedRating || products[productIndex].rating;
      
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    }
  }

  // Reviews Management
  addReview(productId, userId, reviewData) {
    const reviews = this.getReviews();
    const user = this.getCurrentUser();

    const newReview = {
      id: `review-${Date.now()}`,
      productId,
      userId,
      userName: user ? user.name : 'Anonymous',
      ...reviewData,
      createdAt: new Date().toISOString(),
    };

    reviews.push(newReview);
    localStorage.setItem(DB_KEYS.REVIEWS, JSON.stringify(reviews));

    // Update user review count
    if (user) {
      this.updateUser(userId, { reviewCount: (user.reviewCount || 0) + 1 });
    }

    return newReview;
  }

  getReviews() {
    return JSON.parse(localStorage.getItem(DB_KEYS.REVIEWS) || '[]');
  }

  getReviewsByProduct(productId) {
    const reviews = this.getReviews();
    return reviews.filter(review => review.productId === productId);
  }

  // Purchase tracking
  recordPurchase(userId, amount) {
    const user = this.getUserById(userId);
    if (user) {
      const updates = {
        totalPurchases: (user.totalPurchases || 0) + 1,
        totalSpent: (user.totalSpent || 0) + amount,
        userWeight: Math.min((user.userWeight || 1.0) + 0.1, 3.0), // Increase weight with purchases
      };
      return this.updateUser(userId, updates);
    }
    return null;
  }

  getUserById(userId) {
    const users = this.getUsers();
    return users.find(u => u.id === userId);
  }
}

export const db = new LocalDatabase();
