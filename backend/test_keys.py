# backend/test_keys.py
import os
from dotenv import load_dotenv

load_dotenv()

def test_keys():
    secret = os.getenv('SECRET_KEY')
    jwt_secret = os.getenv('JWT_SECRET_KEY')

    print("=" * 50)
    print("🔑 Verifying JWT Keys for StockPilot")
    print("=" * 50)

    if not secret:
        print("❌ SECRET_KEY not found in .env file!")
    else:
        print(f"✅ SECRET_KEY loaded: {secret[:10]}...{secret[-10:]}")

    if not jwt_secret:
        print("❌ JWT_SECRET_KEY not found in .env file!")
    else:
        print(f"✅ JWT_SECRET_KEY loaded: {jwt_secret[:10]}...{jwt_secret[-10:]}")

    if secret and jwt_secret:
        print("\n🎉 All keys are loaded successfully!")
        print("You can now run your Flask application.")

if __name__ == "__main__":
    test_keys()