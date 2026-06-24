import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Explicitly load .env from current directory
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

def test_connection():
    print("=" * 60)
    print("🔍 Testing MongoDB Connection")
    print("=" * 60)
    
    mongo_uri = os.getenv("MONGO_URI")
    
    print(f"\n📡 Looking for MONGO_URI...")
    
    if not mongo_uri:
        print("❌ MONGO_URI not found!")
        print("\n📁 Checking if .env file exists...")
        if os.path.exists('.env'):
            print("✅ .env file exists")
            # Try to read it directly
            with open('.env', 'r') as f:
                content = f.read()
                print(f"📄 .env content:")
                print(content[:100] + "...")
        else:
            print("❌ .env file not found!")
        return False
    
    print(f"✅ MONGO_URI found: {mongo_uri[:30]}...")
    
    try:
        client = MongoClient(mongo_uri)
        client.admin.command('ping')
        print("✅ Connection successful!")
        
        db_list = client.list_database_names()
        print(f"📚 Available databases: {db_list}")
        
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    # Also print current directory
    print(f"📂 Current directory: {os.getcwd()}")
    print(f"📂 .env path: {os.path.abspath('.env')}")
    test_connection()