# Quick Setup Guide

## Prerequisites
- Node.js 16 or higher
- npm (comes with Node.js)

## Installation Steps

1. **Extract the project files** to your desired location

2. **Open terminal/command prompt** in the project directory

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to the URL shown in terminal (usually http://localhost:5173)

## First Time Use

### Create a Buyer Account
1. Click "Sign Up" in the top right
2. Fill in your details
3. **Important**: Select "Buyer" as account type for enhanced features
4. Click "Create Account"

### Explore as a Viewer
You can browse without an account, but you won't be able to vote or review products.

## Key Features to Try

### 1. Browse Products
- Click "Explore Products" on homepage
- Use category filters (Apparel, Electronics, Haircare, Services)
- View individual product pages

### 2. Visit Seller Stores
- Click on any seller card
- View their complete product gallery
- See seller ratings and statistics

### 3. Vote on Products (Requires Login)
- Open any product page
- Click the stars to rate (1-5)
- **Buyers**: Your vote counts 1.5x more!

### 4. Write Reviews (Requires Login)
- Scroll down on any product page
- Rate and write your review
- View all reviews from other users

### 5. Track Your Profile (Buyers Only)
- Click your profile icon → "My Profile"
- View your statistics:
  - Total purchases
  - Vote weight
  - Activity history

## Default Demo Data

The app comes pre-loaded with:
- 4 verified sellers
- 12 products across all categories
- Sample ratings and vote counts

## Vote Weight System

**Viewers**: 1.0x weight
**Buyers**: 
- Start: 1.5x weight
- Increases 0.1x per purchase
- Maximum: 3.0x weight

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Troubleshooting

**Port already in use?**
- Vite will automatically try the next available port
- Check the terminal for the actual URL

**Styles not loading?**
- Clear browser cache
- Restart the dev server

**Data not persisting?**
- Check if localStorage is enabled in your browser
- Try in a different browser

## Tips

1. Create a Buyer account to unlock all features
2. Try voting on multiple products to see weighted ratings
3. Leave reviews to increase your profile stats
4. Visit different seller stores to see varied layouts

Enjoy exploring the Marketplace! 🎉
