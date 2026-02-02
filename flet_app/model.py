import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

class LoanPredictor:
    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.feature_columns = None
        self.model_metrics = {}
        
    def load_data(self, train_path):
        """Load training data"""
        df = pd.read_csv(train_path)
        return df
    
    def preprocess_data(self, df, is_training=True):
        """Preprocess the data"""
        df = df.copy()
        
        # Drop Loan_ID as it's not a feature
        if 'Loan_ID' in df.columns:
            df = df.drop('Loan_ID', axis=1)
        
        # Define default values
        defaults = {
            'Gender': 'Male',
            'Married': 'Yes',
            'Dependents': '0',
            'Self_Employed': 'No',
            'Education': 'Graduate',
            'Property_Area': 'Semiurban',
            'ApplicantIncome': 5000,
            'CoapplicantIncome': 0,
            'LoanAmount': 120,
            'Loan_Amount_Term': 360,
            'Credit_History': 1.0
        }
        
        # Fill missing values with defaults
        for col, default_val in defaults.items():
            if col in df.columns:
                df[col].fillna(default_val, inplace=True)
        
        # Feature Engineering
        df['TotalIncome'] = df['ApplicantIncome'] + df['CoapplicantIncome']
        df['LoanAmountToIncome'] = df['LoanAmount'] / (df['TotalIncome'] + 1)
        df['EMI'] = df['LoanAmount'] / (df['Loan_Amount_Term'] + 1)
        
        # Replace any inf values
        df.replace([np.inf, -np.inf], 0, inplace=True)
        
        # Encode categorical variables
        categorical_features = ['Gender', 'Married', 'Dependents', 'Education', 'Self_Employed', 'Property_Area']
        
        for col in categorical_features:
            if col in df.columns:
                if is_training:
                    self.label_encoders[col] = LabelEncoder()
                    df[col] = self.label_encoders[col].fit_transform(df[col].astype(str))
                else:
                    if col in self.label_encoders:
                        # Handle unseen labels
                        df[col] = df[col].astype(str)
                        # Map unseen labels to the first class
                        df[col] = df[col].apply(lambda x: x if x in self.label_encoders[col].classes_ else self.label_encoders[col].classes_[0])
                        df[col] = self.label_encoders[col].transform(df[col])
        
        # Final safety check - fill any remaining NaN with 0
        df.fillna(0, inplace=True)
        
        return df
    
    def predict(self, data):
        """Make predictions on new data"""
        if self.model is None:
            raise ValueError("Model not trained yet!")
        
        # Preprocess
        df = pd.DataFrame([data]) if isinstance(data, dict) else data.copy()
        
        # Remove Loan_ID if present
        if 'Loan_ID' in df.columns:
            df = df.drop('Loan_ID', axis=1)
        
        df = self.preprocess_data(df, is_training=False)
        
        # Ensure all feature columns are present
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0
        
        df = df[self.feature_columns]
        
        # Scale
        df_scaled = self.scaler.transform(df)
        
        # Predict
        prediction = self.model.predict(df_scaled)
        probability = self.model.predict_proba(df_scaled)
        
        return {
            'prediction': 'Approved' if prediction[0] == 1 else 'Rejected',
            'probability': float(probability[0][1]),
            'confidence': float(max(probability[0]))
        }
    
    def load_model(self, model_dir='models'):
        """Load a trained model and preprocessors"""
        self.model = joblib.load(os.path.join(model_dir, 'loan_model.pkl'))
        self.scaler = joblib.load(os.path.join(model_dir, 'scaler.pkl'))
        self.label_encoders = joblib.load(os.path.join(model_dir, 'label_encoders.pkl'))
        self.feature_columns = joblib.load(os.path.join(model_dir, 'feature_columns.pkl'))
        self.model_metrics = joblib.load(os.path.join(model_dir, 'model_metrics.pkl'))
        
        print("Model loaded successfully!")
