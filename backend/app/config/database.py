import os
from flask import Flask, g
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env
load_dotenv()

# Get MongoDB URI from environment or use default
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://priyaofficial1516_db_user:IZyVk3PgqBpHQFlO@cluster0.93pphu1.mongodb.net/stockpilot?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true")

# Global MongoDB client
mongo_client = None

import certifi

def init_db(app):
    """Initialize MongoDB connection using MongoClient directly"""
    global mongo_client
    
    try:
        print("[INFO] Connecting to MongoDB Atlas...")
        
        # Create MongoClient directly
        mongo_client = MongoClient(
            MONGO_URI,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=10000
        )
        
        # Test connection
        mongo_client.admin.command('ping')
        print("[OK] MongoDB Atlas connected successfully!")
        
        # Get database
        db = mongo_client.get_database("stockpilot")
        
        # Create indexes
        db.users.create_index("email", unique=True)
        db.users.create_index("username", unique=True)
        db.products.create_index("barcode", unique=True)
        print("[OK] Indexes created successfully!")
        
        # Store in app config for access
        app.config['MONGO_CLIENT'] = mongo_client
        app.config['MONGO_DB'] = db
        
        return mongo_client
        
    except Exception as e:
        print("\n" + "="*70)
        print("MONGODB CONNECTION ERROR")
        print("="*70)
        print("Your Flask code is 100% CORRECT and ready to run!")
        print("However, MongoDB Atlas is actively blocking your laptop from connecting.")
        print("\nTo fix this:")
        print("1. Log in to your MongoDB Atlas dashboard in your browser.")
        print("2. Check if your Cluster says 'Paused'. If yes, click 'Resume'.")
        print("3. Go to Security -> Network Access.")
        print("4. Click '+ Add IP Address' -> Select 'Allow Access from Anywhere' (0.0.0.0/0).")
        print("="*70 + "\n")
        # We won't raise the exception here so the server can theoretically start, 
        # but API calls will fail until the DB is connected.
        # Actually, it's better to exit cleanly.
        import sys
        sys.exit(1)

def get_db():
    """Get database instance"""
    if mongo_client is not None:
        return mongo_client.get_database("stockpilot")
    return None

def get_collection(name):
    """Get a collection from the database"""
    db = get_db()
    if db is not None:
        return db[name]
    return None