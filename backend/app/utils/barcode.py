"""
Barcode Utilities
Handles barcode generation, validation, and scanning
"""

import re
import random
import string
from datetime import datetime
import barcode
from barcode.writer import ImageWriter
from io import BytesIO
import base64

def generate_barcode(data=None, format='ean13'):
    """
    Generate a barcode image as base64 string
    
    Args:
        data: Barcode data (if None, generates random)
        format: Barcode format (ean13, code128, upc, etc.)
    
    Returns:
        dict: Contains barcode data and base64 image
    """
    try:
        if not data:
            # Generate random EAN-13 barcode
            data = generate_product_code()
        
        # Create barcode
        barcode_class = barcode.get_barcode_class(format)
        barcode_obj = barcode_class(data, writer=ImageWriter())
        
        # Generate image
        buffer = BytesIO()
        barcode_obj.write(buffer, options={
            'module_width': 0.2,
            'module_height': 15.0,
            'quiet_zone': 6.5,
            'font_size': 10,
            'text_distance': 5.0,
            'background': 'white',
            'foreground': 'black'
        })
        
        # Convert to base64
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return {
            'barcode': data,
            'format': format,
            'image': f'data:image/png;base64,{image_base64}',
            'generated_at': datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            'error': str(e),
            'barcode': data,
            'format': format
        }

def validate_barcode(barcode):
    """
    Validate a barcode number
    
    Args:
        barcode: Barcode string to validate
    
    Returns:
        dict: Validation result with details
    """
    if not barcode or not isinstance(barcode, str):
        return {
            'valid': False,
            'error': 'Invalid barcode format'
        }
    
    # Remove any non-numeric characters
    clean_barcode = re.sub(r'[^0-9]', '', barcode)
    
    # Check length (EAN-13, EAN-8, UPC-A, etc.)
    valid_lengths = [8, 12, 13]
    if len(clean_barcode) not in valid_lengths:
        return {
            'valid': False,
            'error': f'Invalid length. Must be one of {valid_lengths}',
            'length': len(clean_barcode)
        }
    
    # Validate check digit for EAN-13
    if len(clean_barcode) == 13:
        check_digit = int(clean_barcode[-1])
        calculated = calculate_ean_check_digit(clean_barcode[:-1])
        if check_digit != calculated:
            return {
                'valid': False,
                'error': 'Invalid check digit',
                'expected': calculated,
                'received': check_digit
            }
    
    # Determine barcode type
    barcode_type = get_barcode_type(clean_barcode)
    
    return {
        'valid': True,
        'barcode': clean_barcode,
        'type': barcode_type,
        'length': len(clean_barcode)
    }

def calculate_ean_check_digit(barcode):
    """
    Calculate EAN-13 check digit
    
    Args:
        barcode: 12-digit barcode without check digit
    
    Returns:
        int: Check digit
    """
    if len(barcode) != 12:
        return None
    
    total = 0
    for i, digit in enumerate(barcode):
        number = int(digit)
        if i % 2 == 0:
            total += number * 1
        else:
            total += number * 3
    
    check_digit = (10 - (total % 10)) % 10
    return check_digit

def get_barcode_type(barcode):
    """
    Determine the type of barcode
    
    Args:
        barcode: Barcode string
    
    Returns:
        str: Barcode type
    """
    length = len(barcode)
    
    if length == 8:
        return 'EAN-8'
    elif length == 12:
        return 'UPC-A'
    elif length == 13:
        return 'EAN-13'
    elif length > 13:
        return 'CODE-128'
    else:
        return 'UNKNOWN'

def generate_product_code():
    """
    Generate a random EAN-13 product code
    
    Returns:
        str: 13-digit product code
    """
    # Generate 12 random digits (first digit is country code)
    # Using 890 (India) as country code
    country_code = '890'
    manufacturer_code = ''.join(random.choices(string.digits, k=5))
    product_code = ''.join(random.choices(string.digits, k=4))
    
    # Combine to get 12 digits
    base_code = country_code + manufacturer_code + product_code
    
    # Calculate check digit
    check_digit = calculate_ean_check_digit(base_code)
    
    return base_code + str(check_digit)

def scan_barcode(image_file):
    """
    Scan barcode from image file
    
    Args:
        image_file: Image file object
    
    Returns:
        dict: Barcode scan result
    """
    # Note: This is a placeholder for actual barcode scanning
    # In production, you would use libraries like pyzbar, zxing, etc.
    
    try:
        # For now, return a mock result
        return {
            'success': True,
            'barcode': generate_product_code(),
            'format': 'EAN-13',
            'message': 'Barcode scanned successfully'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def generate_qr_code(data):
    """
    Generate QR code for product
    
    Args:
        data: Data to encode in QR code
    
    Returns:
        dict: QR code image as base64
    """
    try:
        import qrcode
        from PIL import Image
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return {
            'success': True,
            'data': data,
            'image': f'data:image/png;base64,{image_base64}',
            'generated_at': datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

# Barcode format mappings
BARCODE_TYPES = {
    'ean13': 'EAN-13',
    'ean8': 'EAN-8',
    'upc': 'UPC-A',
    'code128': 'CODE-128',
    'code39': 'CODE-39',
    'code93': 'CODE-93',
    'codabar': 'CODABAR',
    'i2of5': 'Interleaved 2 of 5'
}

def get_supported_formats():
    """Get list of supported barcode formats"""
    return list(BARCODE_TYPES.keys())

def format_barcode_for_display(barcode):
    """
    Format barcode for display with proper grouping
    
    Args:
        barcode: Barcode string
    
    Returns:
        str: Formatted barcode
    """
    if not barcode:
        return ''
    
    clean = re.sub(r'[^0-9]', '', barcode)
    
    if len(clean) == 13:
        # EAN-13: 3-6-4
        return f"{clean[:3]}-{clean[3:9]}-{clean[9:]}"
    elif len(clean) == 12:
        # UPC-A: 1-5-5-1
        return f"{clean[0]}-{clean[1:6]}-{clean[6:11]}-{clean[11]}"
    elif len(clean) == 8:
        # EAN-8: 4-4
        return f"{clean[:4]}-{clean[4:]}"
    else:
        return clean