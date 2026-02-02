from flask import Flask, request, jsonify
from flask_cors import CORS
from model import LoanPredictor
import pandas as pd
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize predictor
predictor = LoanPredictor()

# Load model if it exists
model_dir = 'models'
if os.path.exists(os.path.join(model_dir, 'loan_model.pkl')):
    predictor.load_model(model_dir)
    print("Model loaded successfully!")
else:
    print("No trained model found. Please train the model first.")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': predictor.model is not None
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """Single prediction endpoint"""
    try:
        data = request.json
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Make prediction
        result = predictor.predict(data)
        
        return jsonify({
            'success': True,
            'data': result
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/predict-batch', methods=['POST'])
def predict_batch():
    """Batch prediction endpoint for CSV files"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'File must be a CSV'}), 400
        
        # Read CSV
        df = pd.read_csv(file)
        
        # Store Loan_IDs if present
        loan_ids = df['Loan_ID'].tolist() if 'Loan_ID' in df.columns else list(range(len(df)))
        
        # Make predictions
        predictions = []
        for idx, row in df.iterrows():
            try:
                result = predictor.predict(row.to_dict())
                predictions.append({
                    'loan_id': loan_ids[idx],
                    'prediction': result['prediction'],
                    'probability': result['probability'],
                    'confidence': result['confidence']
                })
            except Exception as e:
                predictions.append({
                    'loan_id': loan_ids[idx],
                    'prediction': 'Error',
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'total': len(predictions),
            'predictions': predictions
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Get model information and metrics"""
    try:
        if predictor.model is None:
            return jsonify({'error': 'Model not loaded'}), 404
        
        return jsonify({
            'success': True,
            'metrics': predictor.model_metrics
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/feature-info', methods=['GET'])
def feature_info():
    """Get feature information"""
    try:
        if predictor.model is None:
            return jsonify({'error': 'Model not loaded'}), 404
        
        return jsonify({
            'success': True,
            'features': predictor.feature_columns,
            'total_features': len(predictor.feature_columns)
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
