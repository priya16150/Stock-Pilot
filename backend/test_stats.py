from app.main import create_app
from app.services.product_service import ProductService
from app.services.transaction_service import TransactionService
from app.services.inventory_service import InventoryService
import traceback

app = create_app()

with app.app_context():
    try:
        ps = ProductService()
        stats = ps.get_inventory_stats()
        print("Inventory stats ok")
        
        ts = TransactionService()
        daily_stats = ts.get_daily_stats()
        print("Daily stats ok")
        
        is_svc = InventoryService()
        report = is_svc.get_inventory_report()
        print("Inventory report ok")
    except Exception as e:
        traceback.print_exc()
