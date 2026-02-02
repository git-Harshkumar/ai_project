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
    
    def train(self, train_path):
        """Train the model"""
        print("Loading data...")
        df = self.load_data(train_path)
        
        print("Preprocessing data...")
        df = self.preprocess_data(df, is_training=True)
        
        # Separate features and target
        X = df.drop('Loan_Status', axis=1)
        y = df['Loan_Status'].map({'Y': 1, 'N': 0})
        
        self.feature_columns = X.columns.tolist()
        
        print(f"Features: {len(self.feature_columns)}")
        print(f"Samples: {len(X)}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        print("\nTraining Random Forest model...")
        self.model = RandomForestClassifier(
            n_estimators=100, 
            random_state=42, 
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Predictions
        y_pred = self.model.predict(X_test_scaled)
        y_pred_proba = self.model.predict_proba(X_test_scaled)[:, 1]
        
        # Metrics
        accuracy = accuracy_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba)
        
        print(f"\nModel Performance:")
        print(f"Accuracy: {accuracy:.4f}")
        print(f"ROC-AUC: {roc_auc:.4f}")
        
        # Store metrics
        self.model_metrics = {
            'model_name': 'Random Forest',
            'accuracy': float(accuracy),
            'roc_auc': float(roc_auc),
            'classification_report': classification_report(y_test, y_pred, output_dict=True),
            'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
        }
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("\nTop 10 Feature Importances:")
        print(feature_importance.head(10))
        
        self.model_metrics['feature_importance'] = feature_importance.to_dict('records')
        
        return self.model_metrics
    
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
    
    def save_model(self, model_dir='models'):
        """Save the trained model and preprocessors"""
        os.makedirs(model_dir, exist_ok=True)
        
        joblib.dump(self.model, os.path.join(model_dir, 'loan_model.pkl'))
        joblib.dump(self.scaler, os.path.join(model_dir, 'scaler.pkl'))
        joblib.dump(self.label_encoders, os.path.join(model_dir, 'label_encoders.pkl'))
        joblib.dump(self.feature_columns, os.path.join(model_dir, 'feature_columns.pkl'))
        joblib.dump(self.model_metrics, os.path.join(model_dir, 'model_metrics.pkl'))
        
        print(f"\nModel saved to {model_dir}/")
    
    def load_model(self, model_dir='models'):
        """Load a trained model and preprocessors"""
        self.model = joblib.load(os.path.join(model_dir, 'loan_model.pkl'))
        self.scaler = joblib.load(os.path.join(model_dir, 'scaler.pkl'))
        self.label_encoders = joblib.load(os.path.join(model_dir, 'label_encoders.pkl'))
        self.feature_columns = joblib.load(os.path.join(model_dir, 'feature_columns.pkl'))
        self.model_metrics = joblib.load(os.path.join(model_dir, 'model_metrics.pkl'))
        
        print("Model loaded successfully!")

if __name__ == "__main__":
    # Train the model
    predictor = LoanPredictor()
    
    # Train on the dataset
    train_path = '../train_u6lujuX_CVtuZ9i.csv'
    metrics = predictor.train(train_path)
    
    # Save the model
    predictor.save_model()
    
    print("\n" + "="*50)
    print("Model training completed!")
    print("="*50)
    
    # Test prediction
    print("\nTesting with a sample prediction...")
    sample_data = {
        'Gender': 'Male',
        'Married': 'Yes',
        'Dependents': '0',
        'Education': 'Graduate',
        'Self_Employed': 'No',
        'ApplicantIncome': 5000,
        'CoapplicantIncome': 2000,
        'LoanAmount': 150,
        'Loan_Amount_Term': 360,
        'Credit_History': 1.0,
        'Property_Area': 'Urban'
    }
    
    result = predictor.predict(sample_data)
    print(f"Prediction: {result['prediction']}")
    print(f"Probability: {result['probability']:.2%}")
    print(f"Confidence: {result['confidence']:.2%}")
