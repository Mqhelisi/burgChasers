"""
Database Models

All database models for the marketplace application.
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy import Text, ARRAY

db = SQLAlchemy()
bcrypt = Bcrypt()


class User(db.Model):
    """User Model - Represents buyers and sellers"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'buyer' or 'seller'
    
    # Buyer-specific fields
    total_purchases = db.Column(db.Integer, default=0)
    total_spent = db.Column(db.Float, default=0.0)
    user_weight = db.Column(db.Float, default=1.0)
    review_count = db.Column(db.Integer, default=0)
    
    # Seller-specific fields
    seller_id = db.Column(db.Integer, db.ForeignKey('sellers.id'), nullable=True)
    category = db.Column(db.String(50), nullable=True)
    verified = db.Column(db.Boolean, default=False)
    verification_requested = db.Column(db.Boolean, default=False)
    verification_requested_at = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    votes = db.relationship('Vote', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    reviews = db.relationship('Review', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        """Verify password"""
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def get_product_limit(self):
        """Get product limit based on verification status"""
        if self.role == 'seller':
            return 15 if self.verified else 5
        return 0
    
    def to_dict(self):
        """Convert user to dictionary for JSON responses"""
        user_dict = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
        
        # Add buyer-specific fields
        if self.role == 'buyer':
            user_dict.update({
                'totalPurchases': self.total_purchases,
                'totalSpent': self.total_spent,
                'userWeight': self.user_weight,
                'reviewCount': self.review_count
            })
        
        # Add seller-specific fields
        if self.role == 'seller':
            user_dict.update({
                'sellerId': self.seller_id,
                'category': self.category,
                'verified': self.verified,
                'verificationRequested': self.verification_requested,
                'productLimit': self.get_product_limit()
            })
        
        return user_dict


class Seller(db.Model):
    """Seller Model - Represents seller stores/profiles"""
    __tablename__ = 'sellers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(50), nullable=False, index=True)
    rating = db.Column(db.Float, default=0.0)
    total_sales = db.Column(db.Integer, default=0)
    verified = db.Column(db.Boolean, default=False)
    description = db.Column(Text, default='')
    banner = db.Column(db.String(500))
    avatar = db.Column(db.String(500))
    website = db.Column(db.String(200), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    products = db.relationship('Product', backref='seller', lazy='dynamic', cascade='all, delete-orphan')
    user = db.relationship('User', backref='seller_profile', uselist=False, foreign_keys=[User.seller_id])
    
    def get_product_count(self):
        """Get number of products"""
        return self.products.count()
    
    def to_dict(self):
        """Convert seller to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'category': self.category,
            'rating': round(self.rating, 1),
            'totalSales': self.total_sales,
            'verified': self.verified,
            'description': self.description,
            'banner': self.banner,
            'avatar': self.avatar,
            'website': self.website,
            'phone': self.phone,
            'productCount': self.get_product_count()
        }


class Product(db.Model):
    """Product Model"""
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey('sellers.id'), nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False, index=True)
    description = db.Column(Text)
    images = db.Column(ARRAY(db.String(500)), default=[])
    rating = db.Column(db.Float, default=0.0)
    votes = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    product_votes = db.relationship('Vote', backref='product', lazy='dynamic', cascade='all, delete-orphan')
    product_reviews = db.relationship('Review', backref='product', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert product to dictionary"""
        return {
            'id': self.id,
            'sellerId': self.seller_id,
            'name': self.name,
            'price': self.price,
            'category': self.category,
            'description': self.description,
            'images': self.images if self.images else [],
            'image': self.images[0] if self.images and len(self.images) > 0 else None,
            'rating': round(self.rating, 1),
            'votes': self.votes
        }


class Vote(db.Model):
    """Vote Model"""
    __tablename__ = 'votes'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Float, default=1.0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('product_id', 'user_id', name='unique_user_product_vote'),
    )
    
    def to_dict(self):
        """Convert vote to dictionary"""
        return {
            'id': self.id,
            'productId': self.product_id,
            'userId': self.user_id,
            'rating': self.rating,
            'weight': self.weight,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }


class Review(db.Model):
    """Review Model"""
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(Text, nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert review to dictionary"""
        return {
            'id': self.id,
            'productId': self.product_id,
            'userId': self.user_id,
            'userName': self.user.name if self.user else 'Unknown',
            'rating': self.rating,
            'comment': self.comment,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
