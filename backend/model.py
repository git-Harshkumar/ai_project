import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score, GridSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import (
    RandomForestClassifier,
    GradientBoostingClassifier,
    VotingClassifier,
    ExtraTreesClassifier,
)
from sklearn.linear_model import LogisticRegression
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

    # ------------------------------------------------------------------ #
    #  Data loading
    # ------------------------------------------------------------------ #
    def load_data(self, train_path):
        """Load training data."""
        df = pd.read_csv(train_path)
        return df

    # ------------------------------------------------------------------ #
    #  Preprocessing & Feature Engineering
    # ------------------------------------------------------------------ #
    def preprocess_data(self, df, is_training=True):
        """Preprocess the data with rich feature engineering."""
        df = df.copy()

        # Drop Loan_ID
        if 'Loan_ID' in df.columns:
            df = df.drop('Loan_ID', axis=1)

        # ── Fill missing values ──────────────────────────────────────── #
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
            'Credit_History': 1.0,
        }
        for col, val in defaults.items():
            if col in df.columns:
                df[col] = df[col].fillna(val)

        # ── Numeric cleaning ─────────────────────────────────────────── #
        df['Dependents'] = df['Dependents'].astype(str).str.replace('3+', '3', regex=False)
        df['Dependents'] = pd.to_numeric(df['Dependents'], errors='coerce').fillna(0)

        # ── Feature Engineering ──────────────────────────────────────── #
        df['TotalIncome'] = df['ApplicantIncome'] + df['CoapplicantIncome']

        # Log transforms (stabilise skewed distributions)
        df['Log_ApplicantIncome']    = np.log1p(df['ApplicantIncome'])
        df['Log_CoapplicantIncome']  = np.log1p(df['CoapplicantIncome'])
        df['Log_LoanAmount']         = np.log1p(df['LoanAmount'])
        df['Log_TotalIncome']        = np.log1p(df['TotalIncome'])

        # Ratios & interaction terms
        df['LoanIncomeRatio']        = df['LoanAmount'] / (df['TotalIncome'] + 1)
        df['EMI']                    = df['LoanAmount'] / (df['Loan_Amount_Term'] + 1)
        df['EMI_to_Income']          = df['EMI'] / (df['TotalIncome'] + 1)
        df['Coapplicant_Ratio']      = df['CoapplicantIncome'] / (df['TotalIncome'] + 1)

        # Credit history interaction
        df['Credit_x_Income']        = df['Credit_History'] * df['Log_TotalIncome']
        df['Credit_x_LoanRatio']     = df['Credit_History'] * df['LoanIncomeRatio']

        # Income per dependent
        df['IncomePerDependent']     = df['TotalIncome'] / (df['Dependents'] + 1)

        # Term categories
        df['Short_Term']             = (df['Loan_Amount_Term'] <= 180).astype(int)
        df['Long_Term']              = (df['Loan_Amount_Term'] >= 360).astype(int)

        # Replace infinities
        df.replace([np.inf, -np.inf], 0, inplace=True)

        # ── Encode categorical columns ───────────────────────────────── #
        categorical_features = ['Gender', 'Married', 'Education', 'Self_Employed', 'Property_Area']

        for col in categorical_features:
            if col in df.columns:
                if is_training:
                    self.label_encoders[col] = LabelEncoder()
                    df[col] = self.label_encoders[col].fit_transform(df[col].astype(str))
                else:
                    if col in self.label_encoders:
                        df[col] = df[col].astype(str)
                        df[col] = df[col].apply(
                            lambda x: x if x in self.label_encoders[col].classes_
                            else self.label_encoders[col].classes_[0]
                        )
                        df[col] = self.label_encoders[col].transform(df[col])

        # Final NaN sweep
        df = df.fillna(0)
        return df

    # ------------------------------------------------------------------ #
    #  Training
    # ------------------------------------------------------------------ #
    def train(self, train_path):
        """Train an ensemble model targeting ~89% accuracy."""
        print("Loading data...")
        df = self.load_data(train_path)

        print("Preprocessing data...")
        df = self.preprocess_data(df, is_training=True)

        # Separate features and target
        X = df.drop('Loan_Status', axis=1)
        y = df['Loan_Status'].map({'Y': 1, 'N': 0})

        self.feature_columns = X.columns.tolist()
        print(f"Features: {len(self.feature_columns)}")
        print(f"Samples:  {len(X)}")

        # ── Train / Test split ───────────────────────────────────────── #
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # ── Scale ───────────────────────────────────────────────────── #
        X_train_s = self.scaler.fit_transform(X_train)
        X_test_s  = self.scaler.transform(X_test)

        # ── Build individual classifiers ─────────────────────────────── #
        rf = RandomForestClassifier(
            n_estimators=300,
            max_depth=12,
            min_samples_split=3,
            min_samples_leaf=1,
            max_features='sqrt',
            class_weight='balanced',
            random_state=42,
            n_jobs=-1,
        )

        gb = GradientBoostingClassifier(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=4,
            min_samples_split=4,
            min_samples_leaf=2,
            subsample=0.85,
            max_features='sqrt',
            random_state=42,
        )

        et = ExtraTreesClassifier(
            n_estimators=300,
            max_depth=12,
            min_samples_split=3,
            min_samples_leaf=1,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1,
        )

        lr = LogisticRegression(
            C=1.0,
            max_iter=1000,
            class_weight='balanced',
            random_state=42,
        )

        # ── Soft-voting ensemble ─────────────────────────────────────── #
        print("\nTraining Ensemble (RF + GB + ExtraTrees + LR)...")
        self.model = VotingClassifier(
            estimators=[('rf', rf), ('gb', gb), ('et', et), ('lr', lr)],
            voting='soft',
            weights=[3, 4, 2, 1],   # Give GB the most weight
            n_jobs=-1,
        )

        self.model.fit(X_train_s, y_train)

        # ── Cross-validation ─────────────────────────────────────────── #
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        cv_scores = cross_val_score(self.model, X_train_s, y_train, cv=cv, scoring='accuracy', n_jobs=-1)
        print(f"CV Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

        # ── Test evaluation ──────────────────────────────────────────── #
        y_pred      = self.model.predict(X_test_s)
        y_pred_prob = self.model.predict_proba(X_test_s)[:, 1]

        accuracy = accuracy_score(y_test, y_pred)
        roc_auc  = roc_auc_score(y_test, y_pred_prob)

        print(f"\nTest Accuracy : {accuracy:.4f}  ({accuracy*100:.2f}%)")
        print(f"ROC-AUC       : {roc_auc:.4f}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))

        # ── Store metrics ─────────────────────────────────────────────── #
        self.model_metrics = {
            'model_name': 'Ensemble (RF + GB + ExtraTrees + LR)',
            'accuracy':   float(accuracy),
            'roc_auc':    float(roc_auc),
            'cv_accuracy_mean': float(cv_scores.mean()),
            'cv_accuracy_std':  float(cv_scores.std()),
            'classification_report': classification_report(y_test, y_pred, output_dict=True),
            'confusion_matrix':      confusion_matrix(y_test, y_pred).tolist(),
        }

        # Feature importance from the RF sub-model
        rf_model = self.model.estimators_[0]
        feature_importance = pd.DataFrame({
            'feature':    self.feature_columns,
            'importance': rf_model.feature_importances_,
        }).sort_values('importance', ascending=False)

        print("\nTop 10 Feature Importances:")
        print(feature_importance.head(10))

        self.model_metrics['feature_importance'] = feature_importance.to_dict('records')

        return self.model_metrics

    # ------------------------------------------------------------------ #
    #  Prediction
    # ------------------------------------------------------------------ #
    def predict(self, data):
        """Make predictions on new data."""
        if self.model is None:
            raise ValueError("Model not trained yet!")

        df = pd.DataFrame([data]) if isinstance(data, dict) else data.copy()

        if 'Loan_ID' in df.columns:
            df = df.drop('Loan_ID', axis=1)

        df = self.preprocess_data(df, is_training=False)

        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0

        df = df[self.feature_columns]
        df_s = self.scaler.transform(df)

        prediction   = self.model.predict(df_s)
        probability  = self.model.predict_proba(df_s)

        return {
            'prediction':  'Approved' if prediction[0] == 1 else 'Rejected',
            'probability': float(probability[0][1]),
            'confidence':  float(max(probability[0])),
        }

    # ------------------------------------------------------------------ #
    #  Save / Load
    # ------------------------------------------------------------------ #
    def save_model(self, model_dir='models'):
        """Save the trained model and preprocessors."""
        os.makedirs(model_dir, exist_ok=True)
        joblib.dump(self.model,           os.path.join(model_dir, 'loan_model.pkl'))
        joblib.dump(self.scaler,          os.path.join(model_dir, 'scaler.pkl'))
        joblib.dump(self.label_encoders,  os.path.join(model_dir, 'label_encoders.pkl'))
        joblib.dump(self.feature_columns, os.path.join(model_dir, 'feature_columns.pkl'))
        joblib.dump(self.model_metrics,   os.path.join(model_dir, 'model_metrics.pkl'))
        print(f"\nModel saved to {model_dir}/")

    def load_model(self, model_dir='models'):
        """Load a trained model and preprocessors."""
        self.model           = joblib.load(os.path.join(model_dir, 'loan_model.pkl'))
        self.scaler          = joblib.load(os.path.join(model_dir, 'scaler.pkl'))
        self.label_encoders  = joblib.load(os.path.join(model_dir, 'label_encoders.pkl'))
        self.feature_columns = joblib.load(os.path.join(model_dir, 'feature_columns.pkl'))
        self.model_metrics   = joblib.load(os.path.join(model_dir, 'model_metrics.pkl'))
        print("Model loaded successfully!")


# ─────────────────────────────────────────────────────────────────────── #
#  Entry point
# ─────────────────────────────────────────────────────────────────────── #
if __name__ == "__main__":
    predictor = LoanPredictor()

    train_path = 'train_u6lujuX_CVtuZ9i.csv'
    metrics = predictor.train(train_path)

    predictor.save_model()

    print("\n" + "=" * 50)
    print(f"Final Accuracy : {metrics['accuracy']*100:.2f}%")
    print(f"ROC-AUC        : {metrics['roc_auc']:.4f}")
    print("=" * 50)

    # Quick sanity check
    sample = {
        'Gender': 'Male', 'Married': 'Yes', 'Dependents': '0',
        'Education': 'Graduate', 'Self_Employed': 'No',
        'ApplicantIncome': 5000, 'CoapplicantIncome': 2000,
        'LoanAmount': 150, 'Loan_Amount_Term': 360,
        'Credit_History': 1.0, 'Property_Area': 'Urban',
    }
    result = predictor.predict(sample)
    print(f"\nSample Prediction : {result['prediction']}")
    print(f"Probability       : {result['probability']:.2%}")
    print(f"Confidence        : {result['confidence']:.2%}")
