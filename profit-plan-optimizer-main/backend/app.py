from flask import Flask, request, jsonify
from flask_cors import CORS
from model import TelecomModel
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Telecom Optimizer API is running"})

@app.route('/optimize', methods=['POST'])
def optimize():
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "status": "No data provided"}), 400

        forfaits = data.get('forfaits', [])
        segments = data.get('segments', [])
        constraints = data.get('constraints', {})

        # Basic validation
        if not forfaits or not segments:
            return jsonify({"success": False, "status": "Missing forfaits or segments data"}), 400

        # Run optimization
        model = TelecomModel(forfaits, segments, constraints)
        result = model.build_and_solve()

        return jsonify(result)

    except Exception as e:
        print("Error during optimization:")
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "status": f"Server Error: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
