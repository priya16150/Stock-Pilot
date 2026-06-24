from dotenv import load_dotenv
import os
from bson import ObjectId

load_dotenv()
from pymongo import MongoClient

mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client[os.getenv('DATABASE_NAME')]

# Fetch the products in the cart
products = list(db.products.find())
for p in products:
    print(f"Product: {p.get('name')} (ID: {p['_id']}, qty: {p.get('quantity')}, min_qty: {p.get('min_quantity')}, type: {type(p.get('quantity'))})")
