"""
Flask Application with Flask-RESTful API

This is a complete rewrite with proper error handling,
validation, and authorization to fix 422 errors.
"""
import base64
from PIL import Image
import os
import requests
from io import BytesIO
from typing import Union, IO, Optional
import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from flask_migrate import Migrate
from sqlalchemy import desc
from werkzeug.exceptions import HTTPException

from config import get_config
from models import db, bcrypt, User, Seller, Product, Vote, Review



def upload_to_imgbb(
    image: Union[str, bytes, IO[bytes]],
    api_key: Optional[str] = None
) -> str:
    """
    Upload an image to imgbb.com and return the direct image URL.

    Args:
        image: The image to upload. Can be:
            - A string (file path) to a local image.
            - A bytes object containing the image data.
            - A file-like object (e.g., an open binary file) with a .read() method.
        api_key: Your imgbb API key. If not provided, the function will try to
                 read it from the environment variable `IMGBB_API_KEY`.

    Returns:
        str: The direct URL of the uploaded image (e.g., https://i.ibb.co/.../image.jpg).

    Raises:
        ValueError: If no API key is found.
        requests.exceptions.RequestException: For network or HTTP errors.
        KeyError: If the API response does not contain the expected image URL.
        Exception: For other errors reported by the imgbb API.
    """
    # --- API key handling ---
    if api_key is None:
        api_key = '45a52a52bdb7b5ebce8571ef33df547d'
    if not api_key:
        raise ValueError(
            "No API key provided. Either pass it as an argument or set the "
            "environment variable IMGBB_API_KEY."
        )

    # --- Prepare the image payload ---
    # imgbb accepts the image as a file in a multipart/form-data request.
    # We need to convert the input into a file-like object that requests can upload.

    if isinstance(image, str):
        # It's a file path -> open the file in binary mode
        file_obj = open(image, "rb")
        # We'll let requests close it automatically after the upload
    elif isinstance(image, bytes):
        # It's raw bytes -> wrap in a BytesIO to make it file-like
        file_obj = BytesIO(image)
    elif hasattr(image, "read"):
        # It's already file-like (e.g., an open file, BytesIO, etc.)
        file_obj = image
    else:
        raise TypeError(
            "Unsupported image type. Expected a file path (str), bytes, "
            "or a file-like object with a .read() method."
        )

    # --- Build the request ---
    url = "https://api.imgbb.com/1/upload"
    params = {
        "key": api_key,
        # You can also add optional parameters like "name" or "expiration" here.
    }
    files = {
        "image": file_obj,  # requests will set the filename and content-type
    }

    # --- Perform the upload ---
    try:
        response = requests.post(url, params=params, files=files)
        response.raise_for_status()  # Raise an exception for HTTP errors (4xx, 5xx)

        # Parse the JSON response
        data = response.json()

        # Check if the API returned an error (imgbb puts errors in the 'error' field)
        if "error" in data:
            raise Exception(f"imgbb API error: {data['error']['message']}")

        # Extract the direct image URL
        # According to imgbb API docs, the URL is located at data['data']['url']
        image_url = data["data"]["url"]
        return image_url

    except KeyError as e:
        # If the expected structure is missing, raise a clear error
        raise KeyError(
            "Unexpected response format from imgbb. Could not find 'data.url'. "
            f"Full response: {data}"
        ) from e
    finally:
        # If we opened the file ourselves (because it was a path), close it.
        # For bytes or existing file objects, we leave them open for the caller to manage.
        if isinstance(image, str) and 'file_obj' in locals():
            file_obj.close()

# # Example usage:
# image_url = upload_to_imgbb("./GOW.jpg")
# print(image_url)



def create_app(config_name=None):
    """Application factory"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(get_config(config_name))
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    migrate = Migrate(app, db)
    CORS(app, 
         origins=app.config['CORS_ORIGINS'],
         supports_credentials=app.config['CORS_SUPPORTS_CREDENTIALS'])
    
    jwt = JWTManager(app)
    api = Api(app, prefix='/api')
    
    # Global error handlers
    @app.errorhandler(Exception)
    def handle_exception(e):
        """Handle all exceptions"""
        if isinstance(e, HTTPException):
            return jsonify({
                'success': False,
                'message': e.description
            }), e.code
        
        # Log the error
        app.logger.error(f'Unhandled exception: {str(e)}')
        
        return jsonify({
            'success': False,
            'message': 'Internal server error'
        }), 500
    
    @app.errorhandler(422)
    def handle_validation_error(e):
        """Handle 422 validation errors"""
        return jsonify({
            'success': False,
            'message': 'Validation error. Please check your input.',
            'errors': getattr(e, 'data', {}).get('messages', {})
        }), 422
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'message': 'Token has expired. Please login again.'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Invalid token. Please login again.'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Authorization token is missing.'
        }), 401
    
    # Create tables
    # with app.app_context():
    #     db.create_all()
    
    # Register resources
    register_resources(api)
    
    return app


def register_resources(api):
    """Register all API resources"""
    
    # Authentication
    api.add_resource(BuyerRegister, '/auth/register')
    api.add_resource(SellerRegister, '/auth/register-seller')
    api.add_resource(Login, '/auth/login')
    api.add_resource(CurrentUser, '/auth/me')
    api.add_resource(RefreshToken, '/auth/refresh')
    
    # Sellers
    api.add_resource(SellerList, '/sellers')
    api.add_resource(SellerDetail, '/sellers/<int:seller_id>')
    api.add_resource(RequestVerification, '/sellers/request-verification')
    api.add_resource(VerifySeller, '/sellers/<int:seller_id>/verify')
    api.add_resource(ProdBySeller, '/seller_prods/<int:seller_id>')
    api.add_resource(PendingVerifications, '/sellers/pending-verifications')
    api.add_resource(UpdateSeller, '/sellers/<int:seller_id>')
    
    # Products
    api.add_resource(ProductList, '/products')
    api.add_resource(ProductDetail, '/products/<int:product_id>')
    
    # Votes
    api.add_resource(VoteList, '/votes')
    
    # Reviews
    api.add_resource(ReviewList, '/reviews/<int:product_id>')
    
    # Health check
    api.add_resource(HealthCheck, '/health')


# ============================================================================
# AUTHENTICATION RESOURCES
# ============================================================================

class BuyerRegister(Resource):
    """Register a new buyer"""
    
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help='Name is required')
        parser.add_argument('email', type=str, required=True, help='Email is required')
        parser.add_argument('password', type=str, required=True, help='Password is required')
        
        try:
            args = parser.parse_args()
        except Exception as e:
            return {
                'success': False,
                'message': 'Invalid input data',
                'errors': str(e)
            }, 400
        
        # Check if email already exists
        if User.query.filter_by(email=args['email']).first():
            return {
                'success': False,
                'message': 'Email already registered'
            }, 409
        
        # Create user
        user = User(
            name=args['name'],
            email=args['email'],
            role='buyer',
            user_weight=1.5
        )
        user.set_password(args['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return {
            'success': True,
            'user': user.to_dict(),
            'token': access_token,
            'refreshToken': refresh_token
        }, 201


class SellerRegister(Resource):
    """Register a new seller directly"""
    
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help='Name is required')
        parser.add_argument('email', type=str, required=True, help='Email is required')
        parser.add_argument('password', type=str, required=True, help='Password is required')
        parser.add_argument('businessName', type=str, required=True, help='Business name is required')
        parser.add_argument('category', type=str, required=True, help='Category is required')
        parser.add_argument('description', type=str, required=True, help='Description is required')
        parser.add_argument('phone', type=str)
        parser.add_argument('website', type=str)
        
        try:
            args = parser.parse_args()
        except Exception as e:
            return {
                'success': False,
                'message': 'Invalid input data',
                'errors': str(e)
            }, 400
        
        # Check if email already exists
        if User.query.filter_by(email=args['email']).first():
            return {
                'success': False,
                'message': 'Email already registered'
            }, 409
        
        # Create seller
        seller = Seller(
            name=args['businessName'],
            email=args['email'],
            category=args['category'],
            description=args['description'],
            verified=False,
            phone=args.get('phone'),
            website=args.get('website'),
            banner='https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop',
            avatar=f'https://ui-avatars.com/api/?name={args["businessName"].replace(" ", "+")}&size=200&background=795c84&color=fff'
        )
        
        db.session.add(seller)
        db.session.flush()
        
        # Create user
        user = User(
            name=args['name'],
            email=args['email'],
            role='seller',
            seller_id=seller.id,
            category=args['category'],
            verified=False
        )
        user.set_password(args['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return {
            'success': True,
            'user': user.to_dict(),
            'seller': seller.to_dict(),
            'token': access_token,
            'refreshToken': refresh_token,
            'message': 'Seller account created! You can post up to 5 products. Request verification to unlock 15 products.'
        }, 201


class Login(Resource):
    """Login for both buyers and sellers"""
    
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('email', type=str, required=True, help='Email is required')
        parser.add_argument('password', type=str, required=True, help='Password is required')
        
        try:
            args = parser.parse_args()
        except Exception as e:
            return {
                'success': False,
                'message': 'Invalid input data',
                'errors': str(e)
            }, 400
        
        user = User.query.filter_by(email=args['email']).first()
        
        if not user or not user.check_password(args['password']):
            return {
                'success': False,
                'message': 'Invalid credentials'
            }, 401
        
        # Create tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        print(access_token)
        return {
            'success': True,
            'user': user.to_dict(),
            'token': access_token,
            'refreshToken': refresh_token
        }, 200


class CurrentUser(Resource):
    """Get current logged-in user"""
    
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return {
                'success': False,
                'message': 'User not found'
            }, 404
        
        return {
            'success': True,
            'user': user.to_dict()
        }, 200


class RefreshToken(Resource):
    """Refresh access token"""
    
    @jwt_required(refresh=True)
    def post(self):
        user_id = get_jwt_identity()
        access_token = create_access_token(identity=user_id)
        
        return {
            'success': True,
            'token': access_token
        }, 200


# ============================================================================
# SELLER RESOURCES
# ============================================================================

class SellerList(Resource):
    """List all sellers"""
    
    def get(self):
        # parser = reqparse.RequestParser()
        # parser.add_argument('category', type=str)
        # parser.add_argument('limit', type=int)
        # parser.add_argument('top', type=str)
        # args = p bg/
        sellers = Seller.query.all()
        
        # if args.get('category'):
        #     query = query.filter_by(category=args['category'])
        
        # if args.get('top') == 'true':
        #     query = query.order_by(desc(Seller.rating))
        
        # if args.get('limit'):
        #     query = query.limit(args['limit'])
        
        # sellers = query.all()
        
        return {
            'success': True,
            'sellers': [seller.to_dict() for seller in sellers]
        }, 200


class SellerDetail(Resource):
    """Get single seller"""
    
    def get(self, seller_id):
        seller = Seller.query.get(seller_id)
        
        if not seller:
            return {
                'success': False,
                'message': 'Seller not found'
            }, 404
        
        return {
            'success': True,
            'seller': seller.to_dict()
        }, 200


class RequestVerification(Resource):
    """Seller requests verification"""
    
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'seller':
            return {
                'success': False,
                'message': 'Unauthorized'
            }, 403
        
        if user.verified:
            return {
                'success': False,
                'message': 'Already verified'
            }, 400
        
        if user.verification_requested:
            return {
                'success': False,
                'message': 'Verification already requested'
            }, 400
        
        user.verification_requested = True
        user.verification_requested_at = datetime.utcnow()
        db.session.commit()
        
        return {
            'success': True,
            'message': 'Verification requested! Admin will review your account.'
        }, 200


class VerifySeller(Resource):
    """Admin verifies a seller"""
    
    @jwt_required()
    def post(self, seller_id):
        # TODO: Add admin role check in production
        
        seller = Seller.query.get(seller_id)
        
        if not seller:
            return {
                'success': False,
                'message': 'Seller not found'
            }, 404
        
        user = User.query.filter_by(seller_id=seller_id).first()
        
        if not user:
            return {
                'success': False,
                'message': 'User not found'
            }, 404
        
        if user.verified:
            return {
                'success': False,
                'message': 'Seller already verified'
            }, 400
        
        seller.verified = True
        user.verified = True
        user.verification_requested = False
        
        db.session.commit()
        
        return {
            'success': True,
            'seller': seller.to_dict(),
            'user': user.to_dict(),
            'message': 'Seller verified successfully! Can now post up to 15 products.'
        }, 200


class UpdateSeller(Resource):

    @jwt_required()
    def put(self, seller_id):
        """Update seller profile (owner only)

        Accepts JSON body with optional fields:
        name, description, phone, website, category, avatar, banner
        Images may be sent as data URLs or remote URLs; data URLs
        will be uploaded to imgbb and replaced with the resulting link.
        """
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role != 'seller' or user.seller_id != seller_id:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 403

        seller = Seller.query.get(seller_id)
        if not seller:
            return jsonify({'success': False, 'message': 'Seller not found'}), 404

        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help='Product name is required')
        parser.add_argument('description', type=str, required=True, help='Price is required')
        parser.add_argument('phone', type=str)
        parser.add_argument('website', type=str, location='json')
        parser.add_argument('category', type=str, location='json')
        
        data = request.get_json(silent=True) or {}
        try:
            args = parser.parse_args()
                  # simple field updates
            if 'name' in data:
                seller.name = args['name']
            if 'description' in data:
                seller.description = args['description']
            if 'phone' in data:
                seller.phone = args['phone']
            if 'website' in data:
                seller.website = args['website']
            if 'category' in data:
                seller.category = args['category']
                # also propagate category to user object so UI can stay in sync
                user.category = args['category']

        except Exception as e:
            return {
                'success': False,
                'message': 'Invalid input data',
                'errors': str(e)
            }, 400
  
        # handle avatar/banner uploads
        for img_field in ('avatar', 'banner'):
            if img_field in data:
                item = data[img_field]
                try:
                    if isinstance(item, str) and item.startswith('data:'):
                        # strip metadata and decode
                        _, b64 = item.split(',', 1)
                        raw = base64.b64decode(b64)
                        url = upload_to_imgbb(raw)
                    elif isinstance(item, str) and item.startswith('http'):
                        url = item
                    else:
                        # fallback – treat as raw bytes
                        url = upload_to_imgbb(item)
                    setattr(seller, img_field, url)
                except Exception as e:
                    print(f"Error uploading {img_field}: {e}")
                    return jsonify({'success': False, 'message': 'Image upload failed'}), 500

        # optionally allow updating user name through ownerName field
        if 'ownerName' in data:
            user.name = data['ownerName']

        db.session.commit()
        return jsonify({
            'success': True,
            'seller': seller.to_dict(),
            'user': user.to_dict()
        }), 200
    


class PendingVerifications(Resource):
    """Get sellers awaiting verification"""
    
    @jwt_required()
    def get(self):
        # TODO: Add admin role check
        
        users = User.query.filter_by(
            role='seller',
            verified=False,
            verification_requested=True
        ).all()
        
        result = []
        for user in users:
            seller = Seller.query.get(user.seller_id)
            if seller:
                seller_data = seller.to_dict()
                seller_data['requestedAt'] = user.verification_requested_at.isoformat() if user.verification_requested_at else None
                seller_data['ownerName'] = user.name
                result.append(seller_data)
        
        return {
            'success': True,
            'sellers': result
        }, 200


# ============================================================================
# PRODUCT RESOURCES
# ============================================================================
class ProdBySeller(Resource):
    """List a particular seller's products"""
    
    def get(self, seller_id):
      
        
        products = Product.query.filter_by(seller_id=seller_id)
        
      
        
        # products = query.all()
        print(products)
        return {
            'success': True,
            'products': [product.to_dict() for product in products]
        }, 200
   



class ProductList(Resource):
    """List and create products"""
    
    def get(self):
        # parser = reqparse.RequestParser()
        # parser.add_argument('category', type=str)
        # parser.add_argument('seller_id', type=int)
        # parser.add_argument('limit', type=int)
        # parser.add_argument('top', type=str)
        # args = parser.parse_args()
        
        query = Product.query
        

        
        products = query.all()
        print(products)
        return {
            'success': True,
            'products': [product.to_dict() for product in products]
        }, 200
    
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        print(user_id)
        user = User.query.get(user_id)
        
        if not user or user.role != 'seller':
            return {
                'success': False,
                'message': 'Unauthorized. Only sellers can create products.'
            }, 403
        
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help='Product name is required')
        parser.add_argument('price', type=float, required=True, help='Price is required')
        parser.add_argument('description', type=str)
        parser.add_argument('images', type=list, location='json')
        
        try:
            args = parser.parse_args()
        except Exception as e:
            return {
                'success': False,
                'message': 'Invalid input data',
                'errors': str(e)
            }, 400
        
        # Check product limit
        seller = Seller.query.get(user.seller_id)
        product_limit = user.get_product_limit()
        current_count = seller.products.count()
        
        if current_count >= product_limit:
            message = f'Product limit reached ({product_limit}). '
            if not user.verified:
                message += 'Request verification to unlock 15 products.'
            return {
                'success': False,
                'message': message
            }, 400
        
        # Validate images
        images = args.get('images', [])
        if len(images) > 5:
            return {
                'success': False,
                'message': 'Maximum 5 images allowed per product'
            }, 400
        imgurls = []
        for each in images:
            comma = each.find(",")
            image64 = each[comma+1:]
            bytes_decoded = base64.b64decode(image64)
            image_obj = BytesIO(bytes_decoded)
            image_url = upload_to_imgbb(image_obj)
            print(image_url)
            imgurls.append(image_url)
        
        # Create product
        product = Product(
            seller_id=user.seller_id,
            name=args['name'],
            price=args['price'],
            category=user.category,
            description=args.get('description', ''),
            images=imgurls
        )
        
        db.session.add(product)
        db.session.commit()
        
        return {
            'success': True,
            'product': product.to_dict(),
            'remaining': product_limit - current_count - 1
        }, 201


class ProductDetail(Resource):
    """Get, update, delete single product"""
    
    def get(self, product_id):
        product = Product.query.get(product_id)
        
        if not product:
            return {
                'success': False,
                'message': 'Product not found'
            }, 404
        
        return {
            'success': True,
            'product': product.to_dict()
        }, 200
    
    @jwt_required()
    def put(self, product_id):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        product = Product.query.get(product_id)
        
        if not product:
            return {
                'success': False,
                'message': 'Product not found'
            }, 404
        
        if product.seller_id != user.seller_id:
            return {
                'success': False,
                'message': 'Unauthorized'
            }, 403
        
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str)
        parser.add_argument('price', type=float)
        parser.add_argument('description', type=str)
        parser.add_argument('images', type=list, location='json')
        
        args = parser.parse_args()
        
        if args.get('name'):
            product.name = args['name']
        if args.get('price'):
            product.price = args['price']
        if args.get('description') is not None:
            product.description = args['description']
        if args.get('images') is not None:
            if len(args['images']) > 5:
                return {
                    'success': False,
                    'message': 'Maximum 5 images allowed'
                }, 400
            product.images = args['images']
        
        product.updated_at = datetime.utcnow()
        db.session.commit()
        
        return {
            'success': True,
            'product': product.to_dict()
        }, 200
    
    @jwt_required()
    def delete(self, product_id):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        product = Product.query.get(product_id)
        
        if not product:
            return {
                'success': False,
                'message': 'Product not found'
            }, 404
        
        if product.seller_id != user.seller_id:
            return {
                'success': False,
                'message': 'Unauthorized'
            }, 403
        
        db.session.delete(product)
        db.session.commit()
        
        return {
            'success': True,
            'message': 'Product deleted successfully'
        }, 200


# ============================================================================
# VOTE RESOURCES
# ============================================================================

class VoteList(Resource):
    """Create vote"""
    
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        parser = reqparse.RequestParser()
        parser.add_argument('product_id', type=int, required=True, help='Product ID is required')
        parser.add_argument('rating', type=int, required=True, help='Rating is required')
        
        try:
            args = parser.parse_args()
        except Exception as e:
            return {
                'success': False,
                'message': 'Invalid input data',
                'errors': str(e)
            }, 400
        
        if not 1 <= args['rating'] <= 5:
            return {
                'success': False,
                'message': 'Rating must be between 1 and 5'
            }, 400
        
        # Check if already voted
        existing_vote = Vote.query.filter_by(
            product_id=args['product_id'],
            user_id=user_id
        ).first()
        
        if existing_vote:
            return {
                'success': False,
                'message': 'You have already voted for this product'
            }, 409
        
        # Create vote
        vote = Vote(
            product_id=args['product_id'],
            user_id=user_id,
            rating=args['rating'],
            weight=user.user_weight
        )
        
        db.session.add(vote)
        
        # Update product rating
        product = Product.query.get(args['product_id'])
        votes = Vote.query.filter_by(product_id=args['product_id']).all()
        
        total_weight = sum(v.weight for v in votes) + vote.weight
        weighted_rating = sum(v.rating * v.weight for v in votes) + (args['rating'] * vote.weight)
        
        product.rating = weighted_rating / total_weight
        product.votes = len(votes) + 1
        
        db.session.commit()
        
        return {
            'success': True,
            'vote': vote.to_dict()
        }, 201


# ============================================================================
# REVIEW RESOURCES
# ============================================================================

class ReviewList(Resource):
    """List and create reviews"""
    
    def get(self, product_id):
        # parser = reqparse.RequestParser()
        # parser.add_argument('product_id', type=int, required=True, help='Product ID is required')
        # args = parser.parse_args()
        
        reviews = Review.query.filter_by(product_id=product_id).all()
        
        return {
            'success': True,
            'reviews': [review.to_dict() for review in reviews]
        }, 200
    
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        
        parser = reqparse.RequestParser()
        parser.add_argument('product_id', type=int, required=True, help='Product ID is required')
        parser.add_argument('rating', type=int, required=True, help='Rating is required')
        parser.add_argument('comment', type=str, required=True, help='Comment is required')
        
        try:
            args = parser.parse_args()
        except Exception as e:
            return {
                'success': False,
                'message': 'Invalid input data',
                'errors': str(e)
            }, 400
        
        review = Review(
            product_id=args['product_id'],
            user_id=user_id,
            rating=args['rating'],
            comment=args['comment']
        )
        
        db.session.add(review)
        
        user = User.query.get(user_id)
        user.review_count += 1
        
        db.session.commit()
        
        return {
            'success': True,
            'review': review.to_dict()
        }, 201


# ============================================================================
# HEALTH CHECK
# ============================================================================

class HealthCheck(Resource):
    """Health check endpoint"""
    
    def get(self):
        return {
            'success': True,
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat()
        }, 200


# ============================================================================
# RUN APPLICATION
# ============================================================================

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
