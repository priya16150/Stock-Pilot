# StockPilot

StockPilot is an advanced, AI-powered inventory management and tracking system. It provides a robust backend API built with Flask and MongoDB, coupled with a responsive, modern frontend built with React, Vite, and Tailwind CSS.

## Features

* **Inventory Tracking:** Manage your stock efficiently.
* **Barcode & QR Code Scanning:** Quickly identify and update items using `html5-qrcode` and `python-barcode`.
* **AI Assistance:** Integrated with Google Generative AI (Gemini) for smart insights and automation.
* **Dashboard & Analytics:** Visual representations of your data using Chart.js.
* **Role-based Access Control:** Secure user authentication and authorization using JWT.
* **Modern UI:** Built with Tailwind CSS, Headless UI, and Framer Motion for a sleek user experience.

## Technology Stack

### Frontend
* **Framework:** React 18 with Vite
* **Styling:** Tailwind CSS, Headless UI, Framer Motion
* **Routing:** React Router v6
* **State Management/Data Fetching:** Axios
* **Charts:** Chart.js, react-chartjs-2
* **Scanning:** html5-qrcode, react-barcode, quagga

### Backend
* **Framework:** Flask 2.3
* **Database:** MongoDB (Flask-PyMongo)
* **Authentication:** Flask-JWT-Extended, bcrypt
* **AI Integration:** google-generativeai
* **Utilities:** python-dotenv, python-barcode, Pillow

## Getting Started

### Prerequisites
* Node.js (v16+)
* Python (v3.8+)
* MongoDB instance

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   * Create a `.env` file in the `backend` directory.
   * Add necessary variables like `MONGO_URI`, `JWT_SECRET_KEY`, and `GOOGLE_API_KEY`. (See `.env.backup` for reference if available).
5. Run the application:
   ```bash
   python run.py # Or python debug.py / flask run
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

The backend includes several test scripts (`test_*.py`) that can be executed to verify functionality.

```bash
cd backend
pytest # or python -m unittest
```
