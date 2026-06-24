from app.main import create_app
from app.config.database import get_db

app = create_app()
with app.app_context():
    db = get_db()
    products = db.products.find()
    fixed_count = 0
    for p in products:
        updates = {}
        if isinstance(p.get('price'), str):
            try:
                updates['price'] = float(p['price']) if p['price'] else 0.0
            except:
                updates['price'] = 0.0
        if isinstance(p.get('quantity'), str):
            try:
                updates['quantity'] = int(p['quantity']) if p['quantity'] else 0
            except:
                updates['quantity'] = 0
        if isinstance(p.get('min_quantity'), str):
            try:
                updates['min_quantity'] = int(p['min_quantity']) if p['min_quantity'] else 5
            except:
                updates['min_quantity'] = 5
                
        if updates:
            db.products.update_one({'_id': p['_id']}, {'$set': updates})
            fixed_count += 1
            
    print(f"Fixed {fixed_count} corrupted products")
