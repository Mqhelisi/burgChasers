"""
Configuration Module for Flask Application

This module handles all configuration settings for different environments.
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration with common settings"""
    
    # Flask Settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-please-change-in-production')
    DEBUG = False
    TESTING = False
    
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'postgresql+psycopg2://postgres:ElPadrino@localhost/marketplace_db'

    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-please-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)  # 30 minutes as requested
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_TOKEN_LOCATION = ['headers', "cookies", "json", "query_string"]
    JWT_VERIFY_SUB = False
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(',')
    CORS_SUPPORTS_CREDENTIALS = True
    
    # Email Configuration (optional)
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@marketplace.com')
    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@marketplace.com')
    
    # Application Settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file upload
    
    # Business Logic
    BUYER_INITIAL_WEIGHT = 1.5
    BUYER_MAX_WEIGHT = 3.0
    WEIGHT_INCREMENT_PER_PURCHASE = 0.1
    UNVERIFIED_SELLER_PRODUCT_LIMIT = 5
    VERIFIED_SELLER_PRODUCT_LIMIT = 15
    MAX_IMAGES_PER_PRODUCT = 5


class DevelopmentConfig(Config):
    """Development environment configuration"""
    DEBUG = True
    # SQLALCHEMY_ECHO = True


class ProductionConfig(Config):
    """Production environment configuration"""
    DEBUG = False
    TESTING = False
    
    # Security settings for production
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Ensure secret keys are set in production
    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        
        # Log to stderr
        import logging
        from logging import StreamHandler
        handler = StreamHandler()
        handler.setLevel(logging.INFO)
        app.logger.addHandler(handler)


class TestingConfig(Config):
    """Testing environment configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://marketplace:marketplace@localhost:5432/marketplace_test_db'
    WTF_CSRF_ENABLED = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)  # Shorter for testing


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


def get_config(env=None):
    """Get configuration for specified environment"""
    if env is None:
        env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
