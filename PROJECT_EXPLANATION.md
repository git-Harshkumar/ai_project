# 📘 Loan Prediction AI — Full Project Explanation

---

## 🧠 What Does This Project Do?

This is a **Loan Approval Prediction System** — an AI-powered web application that predicts whether a bank loan application will be **Approved ✅** or **Rejected ❌**, based on applicant details.

A user fills in details like income, loan amount, credit history etc., and the system uses a **Machine Learning model (Random Forest)** to instantly predict the outcome along with an **approval probability percentage**.

---

## 🗂️ Folder Structure — Explained

```
python_project/
│
├── 📄 train_u6lujuX_CVtuZ9i.csv       ← ORIGINAL raw training dataset (614 applicants)
├── 📄 train_preprocessed.csv           ← CLEANED dataset (no missing values)
├── 📄 test_Y3wMUE5_7gLdaTN.csv         ← Test dataset (for batch predictions)
├── 📄 sample_loan_applications.csv     ← Sample CSV to test batch upload feature
├── 📄 flow_diagram.md                  ← Visual flow diagram of the whole project
├── 📄 PROJECT_EXPLANATION.md           ← THIS FILE — full explanation
├── 📄 render.yaml                      ← Deployment config for Render.com
├── 📄 README.md                        ← Basic project readme
│
├── 📁 backend/                         ← Python Flask API (the "brain")
│   ├── app.py                          ← Main Flask server — handles all API requests
│   ├── model.py                        ← ML model class — training + prediction logic
│   ├── preprocess_data.py              ← Data cleaning script
│   ├── requirements.txt                ← Python packages needed
│   ├── build.sh                        ← Script for deployment build
│   ├── train_u6lujuX_CVtuZ9i.csv       ← Copy of training data for backend use
│   ├── train_preprocessed.csv          ← Cleaned data used during training
│   ├── training_output.txt             ← Log of model training results
│   └── 📁 models/                      ← Saved trained model files
│       ├── loan_model.pkl              ← The trained Random Forest model
│       ├── scaler.pkl                  ← StandardScaler (normalizes numbers)
│       ├── label_encoders.pkl          ← Encodes text→numbers (Male→0, Female→1)
│       ├── feature_columns.pkl         ← List of features the model was trained on
│       └── model_metrics.pkl           ← Accuracy, ROC-AUC scores etc.
│
└── 📁 frontend/                        ← React + Vite app (the "face")
    ├── .env                            ← Local environment variables
    ├── .env.production                 ← Production environment variables
    └── 📁 src/
        ├── main.jsx                    ← React app entry point
        ├── App.jsx                     ← Main app routing and layout
        ├── App.css                     ← Root-level styles
        ├── index.css                   ← Global styles
        └── 📁 components/
            ├── Navbar.jsx              ← Top navigation bar
            ├── Hero.jsx                ← Landing page hero section
            ├── Features.jsx            ← Feature highlights section
            ├── PredictionForm.jsx      ← 🌟 Main form for single prediction
            ├── FileUpload.jsx          ← 🌟 Batch CSV upload prediction
            ├── Dashboard.jsx           ← Model metrics and charts dashboard
            └── Footer.jsx              ← Footer component
```

---

## ⚙️ How Each File Works

### 🔵 Backend Files

#### `backend/preprocess_data.py`
- A **standalone script** to clean the raw dataset before training
- Reads `train_u6lujuX_CVtuZ9i.csv`
- Fills missing values:
  - **Categorical** (Gender, Married, Dependents, Self_Employed) → filled with **Mode** (most common value)
  - **Numerical** (LoanAmount) → filled with **Median**
  - **Credit_History** → filled with constant `1.0`
- Saves the clean data as `train_preprocessed.csv`
- Run it with: `python preprocess_data.py`

---

#### `backend/model.py` — The `LoanPredictor` class
This is the **core ML engine**. It has 4 key responsibilities:

| Method | What it does |
|---|---|
| `load_data()` | Reads the CSV dataset |
| `preprocess_data()` | Cleans + encodes + engineers features |
| `train()` | Trains the Random Forest model and saves metrics |
| `predict()` | Takes new applicant data and returns Approved/Rejected |
| `save_model()` | Saves trained model to `models/` folder as `.pkl` files |
| `load_model()` | Loads the saved model when Flask server starts |

**Feature Engineering** inside `preprocess_data()`:
```
TotalIncome         = ApplicantIncome + CoapplicantIncome
LoanAmountToIncome  = LoanAmount / (TotalIncome + 1)
EMI                 = LoanAmount / (Loan_Amount_Term + 1)
```
These 3 derived features help the model understand **ability to repay**.

**ML Algorithm used:**
```
Random Forest Classifier
- 100 decision trees
- max_depth = 10
- 80% training data, 20% testing data
```

---

#### `backend/app.py` — Flask API Server
This is the **web server** that connects the ML model to the frontend.

| Endpoint | Method | What it does |
|---|---|---|
| `/` | GET | Lists all available API routes |
| `/api/health` | GET | Confirms server + model is running |
| `/api/predict` | POST | Single applicant prediction |
| `/api/predict-batch` | POST | Upload CSV for bulk predictions |
| `/api/model-info` | GET | Returns accuracy, ROC-AUC, confusion matrix |
| `/api/feature-info` | GET | Lists feature names used by the model |

- Runs on **port 5000**
- Uses **CORS** to allow the React frontend to communicate with it
- Loads the model from `models/loan_model.pkl` on startup

---

### 🟢 Frontend Files

#### `frontend/src/components/PredictionForm.jsx` 🌟
- The **main prediction form** the user fills in
- Collects: Gender, Married, Dependents, Education, Self_Employed, ApplicantIncome, CoapplicantIncome, LoanAmount, Loan_Amount_Term, Credit_History, Property_Area
- Sends data to `POST /api/predict` via `fetch()`
- Displays: **Approved/Rejected**, Probability %, Confidence %

#### `frontend/src/components/FileUpload.jsx` 🌟
- Allows uploading a **CSV file** with multiple applicants
- Sends file to `POST /api/predict-batch`
- Displays a table of all predictions

#### `frontend/src/components/Dashboard.jsx`
- Shows **model performance metrics**: Accuracy, ROC-AUC
- Shows feature importance charts

#### `frontend/src/App.jsx`
- The root component that assembles all pages/components together
- Handles page routing (Home → Predict → Dashboard)

---

## 🔄 How It All Connects — Request Flow

```
User fills form
     ↓
PredictionForm.jsx (React)
     ↓  POST /api/predict (JSON)
app.py (Flask server — port 5000)
     ↓
predictor.predict(data)
     ↓
preprocess_data() → encode + scale input
     ↓
RandomForestClassifier.predict()
     ↓
Returns: { prediction, probability, confidence }
     ↓
app.py sends JSON response back
     ↓
React UI displays result to user ✅
```

---

## 🚀 How to Run the Project

### Step 1 — Start the Backend (Flask)
```bash
cd backend
python app.py
# Runs at http://localhost:5000
```

### Step 2 — Start the Frontend (React)
```bash
cd frontend
npm install       # Only needed first time
npm run dev
# Runs at http://localhost:5173
```

### Step 3 — Open in Browser
```
http://localhost:5173
```

---

## 📊 Dataset Information

| Property | Value |
|---|---|
| **File** | `train_u6lujuX_CVtuZ9i.csv` |
| **Total Records** | 614 loan applicants |
| **Target Column** | `Loan_Status` (Y = Approved, N = Rejected) |
| **Approval Rate** | ~68.7% |
| **Missing Values** | Present in 7 columns → fixed by `preprocess_data.py` |

**Input Features:**

| Feature | Type | Description |
|---|---|---|
| Gender | Categorical | Male / Female |
| Married | Categorical | Yes / No |
| Dependents | Categorical | 0, 1, 2, 3+ |
| Education | Categorical | Graduate / Not Graduate |
| Self_Employed | Categorical | Yes / No |
| ApplicantIncome | Numerical | Monthly income |
| CoapplicantIncome | Numerical | Co-applicant monthly income |
| LoanAmount | Numerical | Loan amount (in thousands) |
| Loan_Amount_Term | Numerical | Term in months (e.g. 360 = 30 yrs) |
| Credit_History | Binary | 1.0 = Good, 0.0 = Poor |
| Property_Area | Categorical | Urban / Semiurban / Rural |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Vanilla CSS |
| **Backend** | Python, Flask, Flask-CORS |
| **ML Model** | scikit-learn (Random Forest) |
| **Data Processing** | Pandas, NumPy |
| **Model Storage** | joblib (.pkl files) |
| **Deployment** | Render.com (render.yaml) |
