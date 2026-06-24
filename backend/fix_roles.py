import sys, os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.config.database import get_collection, init_db
from flask import Flask

def fix_roles():
    app = Flask(__name__)
    app.config['MONGO_URI'] = os.getenv('MONGODB_URI')
    init_db(app)
    users = get_collection('users')
    result = users.update_many(
        {'role': {'$ne': 'cashier'}}, 
        {'$set': {'role': 'admin'}}
    )
    print(f"Updated {result.modified_count} users to admin role.")

if __name__ == '__main__':
    fix_roles()
