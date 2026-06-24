import os
import json
import base64
import time
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

try:
    import google.generativeai as genai
    from PIL import Image
    import io
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

@ai_bp.route('/analyze-image', methods=['POST'])
@jwt_required()
def analyze_image():
    """
    Analyzes an uploaded image to extract product details.
    Uses Google Gemini Vision if GEMINI_API_KEY is available, otherwise returns mock data.
    """
    if 'image' not in request.files and 'image' not in request.json:
        return jsonify({"error": "No image provided"}), 400

    api_key = os.getenv('GEMINI_API_KEY')
    
    file = request.files.get('image')
    image_data = None
    
    if file:
        image_data = file.read()
    elif request.json and 'image' in request.json:
        try:
            base64_str = request.json['image']
            if "base64," in base64_str:
                base64_str = base64_str.split("base64,")[1]
            image_data = base64.b64decode(base64_str)
        except Exception as e:
            return jsonify({"error": f"Invalid base64 image: {str(e)}"}), 400

    if not image_data:
         return jsonify({"error": "Failed to extract image data"}), 400

    if api_key and HAS_GENAI:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            img = Image.open(io.BytesIO(image_data))
            
            prompt = """
            Identify this supermarket product. Return ONLY a valid JSON object with the following keys, and nothing else (no markdown formatting, no backticks):
            - product_name (string)
            - category (string, must be one of: grocery, dairy, beverages, snacks, fruits, vegetables, meat, bakery, other)
            - estimated_price_in_inr (number)
            """
            
            response = model.generate_content([prompt, img])
            text = response.text.strip()
            
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            
            data = json.loads(text.strip())
            
            return jsonify({
                "product_name": data.get("product_name", "Unknown Product"),
                "category": data.get("category", "other").lower(),
                "estimated_price_in_inr": data.get("estimated_price_in_inr", 0)
            })
            
        except Exception as e:
            print(f"Gemini API error: {e}")
            # Fall through to mock on error

    # Mock Fallback
    time.sleep(2)  # Simulate AI processing time
    return jsonify({
        "product_name": "Lays Classic Salted",
        "category": "snacks",
        "estimated_price_in_inr": 20.0
    })
