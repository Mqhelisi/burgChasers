# Marketplace - Online Salesmen Platform

A modern, feature-rich online marketplace designed to empower individual salespeople to showcase their trending products to a wide audience at a low cost.

## 🌟 Features

### Core Functionality
- **Individual Seller Pages**: Each seller gets their own landing page with customizable product galleries
- **Category-Based Organization**: Products organized into Apparel, Electronics, Haircare, and Services
- **Top Sellers Showcase**: Displays top-performing sellers in each category on the main page
- **User Role System**: Three distinct user types with different capabilities:
  - **Viewer**: Browse products and sellers (can be unregistered)
  - **Buyer**: Enhanced features with weighted voting and purchase tracking
  - **Seller**: (Future implementation)

### User Features
- **Advanced Voting System**: 
  - All users can vote on products with 1-5 star ratings
  - Registered Buyers get weighted votes (starting at 1.5x)
  - Vote weight increases with purchases (up to 3.0x)
  - Weighted algorithm ensures quality ratings

- **Review System**: 
  - Authenticated users can write detailed reviews
  - Reviews tracked in user profiles
  - Real-time review display on product pages

- **User Profiles**:
  - Track total purchases and spending
  - Monitor vote weight progression
  - View activity history (votes and reviews)
  - Personalized statistics dashboard

### Design & UX
- **Modern Color Scheme**: Warm orange/primary with purple accents
- **Smooth Animations**: 
  - Scroll-triggered animations
  - Hover effects on all interactive elements
  - Framer Motion powered transitions
- **Responsive Design**: Fully mobile-friendly with Tailwind CSS
- **Glass-morphism Effects**: Modern frosted glass UI elements
- **Gradient Overlays**: Eye-catching visual hierarchy

## 🚀 Tech Stack

- **React 18** with Vite for lightning-fast development
- **Framer Motion** for smooth animations
- **Tailwind CSS** for utility-first styling
- **React Router** for client-side routing
- **LocalStorage Database** for persistent data

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Quick Start

```bash
# Navigate to project directory
cd marketplace

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🗂️ Project Structure

```
marketplace/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Navigation & user menu
│   │   ├── Hero.jsx            # Landing page hero section
│   │   └── CategorySection.jsx # Category-based product display
│   ├── pages/
│   │   ├── Home.jsx            # Main landing page
│   │   ├── Login.jsx           # User authentication
│   │   ├── Register.jsx        # User registration
│   │   ├── Categories.jsx      # All products by category
│   │   ├── Sellers.jsx         # All sellers listing
│   │   ├── SellerPage.jsx      # Individual seller store
│   │   ├── ProductPage.jsx     # Product details & reviews
│   │   └── Profile.jsx         # User profile & stats
│   ├── AuthContext.jsx         # Authentication state management
│   ├── database.js             # LocalStorage database utility
│   ├── App.jsx                 # Main app component & routing
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles & Tailwind
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 💾 Database Schema

The application uses LocalStorage with the following data structure:

### Users
```javascript
{
  id: 'user-{timestamp}',
  name: string,
  email: string,
  password: string,
  role: 'viewer' | 'buyer',
  totalPurchases: number,
  totalSpent: number,
  userWeight: number,        // 1.0 for viewers, 1.5+ for buyers
  reviewCount: number,
  createdAt: ISO timestamp
}
```

### Sellers
```javascript
{
  id: 'seller-{id}',
  name: string,
  email: string,
  category: string,
  rating: number,
  totalSales: number,
  verified: boolean,
  description: string,
  banner: URL,
  avatar: URL
}
```

### Products
```javascript
{
  id: 'prod-{id}',
  sellerId: string,
  name: string,
  price: number,
  category: string,
  image: URL,
  rating: number,           // Weighted average
  votes: number
}
```

### Votes
```javascript
{
  id: 'vote-{timestamp}',
  productId: string,
  userId: string,
  rating: number,
  weight: number,           // User's vote weight at time of vote
  createdAt: ISO timestamp
}
```

### Reviews
```javascript
{
  id: 'review-{timestamp}',
  productId: string,
  userId: string,
  userName: string,
  rating: number,
  comment: string,
  createdAt: ISO timestamp
}
```

## 🎯 User Journey

### As a Viewer (Unregistered/Registered)
1. Browse products by category
2. View seller profiles and product galleries
3. See ratings and reviews
4. Can vote on products (registered viewers only)

### As a Buyer (Registered)
1. All viewer capabilities
2. **Enhanced voting power** - votes count 1.5x initially
3. Write detailed product reviews
4. Track purchase history and spending
5. **Vote weight increases** with purchases (up to 3.0x)
6. Access personalized profile dashboard

### Seller Features (Landing Page)
Each seller gets:
- Custom banner and profile image
- Product gallery with multiple items
- Contact information display
- Rating and sales statistics
- Professional store layout

## 🎨 Design System

### Colors
- **Primary**: Orange gradient (#f97316 to #ea580c)
- **Accent**: Purple gradient (#d946ef to #c026d3)
- **Dark**: Slate scale for text and backgrounds

### Typography
- **Display Font**: Poppins (headings)
- **Body Font**: Inter (content)

### Animations
- Floating elements on hero section
- Card hover effects with lift and shadow
- Smooth page transitions
- Button click animations
- Scroll-triggered reveals

## 🔐 Authentication System

- Local storage-based session management
- Role-based access control
- Protected routes for authenticated features
- Persistent login sessions

## 📊 Voting & Ranking Algorithm

Products are ranked using a weighted voting system:

```javascript
weightedRating = Σ(rating × userWeight) / Σ(userWeight)
```

Where:
- Base weight = 1.0 (viewers)
- Buyer starting weight = 1.5
- Weight increases by 0.1 per purchase
- Maximum weight = 3.0

This ensures that engaged buyers with purchase history have more influence on product rankings.

## 🚀 Future Enhancements

- Seller registration and dashboard
- Payment integration
- Shopping cart functionality
- Order management system
- Real-time chat with sellers
- Advanced search and filters
- Wishlist functionality
- Email notifications
- Social sharing features

## 📝 License

This project is created for educational and demonstration purposes.

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your own needs.

## 📧 Support

For questions or issues, please create an issue in the repository.

---

Built with ❤️ using React, Framer Motion, and Tailwind CSS
