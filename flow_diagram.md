# Loan Prediction AI — Project Flow Diagram

## 🗂️ Full System Architecture

```mermaid
flowchart TD
    A["📄 Raw Dataset\ntrain_u6lujuX_CVtuZ9i.csv\n614 records, 13 columns"] --> B

    subgraph PREPROCESS["🧹 Data Preprocessing — preprocess_data.py"]
        B["Analyze Missing Values"] --> C["Fill Categorical Columns\nwith Mode\nGender, Married, Dependents,\nSelf_Employed, Loan_Amount_Term"]
        C --> D["Fill Numerical Column\nwith Median\nLoanAmount"]
        D --> E["Fill Credit_History\nwith constant 1.0"]
        E --> F["✅ Clean Dataset\ntrain_preprocessed.csv\n0 missing values"]
    end

    F --> G

    subgraph MLPIPELINE["🤖 ML Pipeline — model.py → LoanPredictor"]
        G["Load Preprocessed CSV"] --> H["Feature Engineering\n+ TotalIncome\n+ LoanAmountToIncome\n+ EMI"]
        H --> I["Label Encode Categoricals\nGender, Married, Dependents,\nEducation, Self_Employed, Property_Area"]
        I --> J["StandardScaler\nNormalize all features"]
        J --> K["Train / Test Split\n80% train — 20% test"]
        K --> L["Train Random Forest\n100 trees, max_depth=10"]
        L --> M["Evaluate Model\nAccuracy + ROC-AUC"]
        M --> N["💾 Save Model\nmodels/loan_model.pkl\nmodels/scaler.pkl\nmodels/label_encoders.pkl"]
    end

    N --> O

    subgraph BACKEND["⚙️ Backend — Flask API — app.py  :5000"]
        O["Load Saved Model\non server startup"] --> P["API Routes"]
        P --> P1["GET /api/health"]
        P --> P2["POST /api/predict\nSingle prediction"]
        P --> P3["POST /api/predict-batch\nCSV file upload"]
        P --> P4["GET /api/model-info\nAccuracy, ROC-AUC"]
        P --> P5["GET /api/feature-info"]
    end

    subgraph FRONTEND["🖥️ Frontend — React + Vite  :5173"]
        Q["User opens\nlocalhost:5173"] --> R["PredictionForm.jsx\nFills applicant details"]
        R --> S["FileUpload.jsx\nOptional CSV batch upload"]
    end

    R -->|"POST /api/predict\nJSON payload"| P2
    S -->|"POST /api/predict-batch\nCSV file"| P3

    P2 -->|"JSON Response\nprediction + probability\n+ confidence"| T
    P3 -->|"JSON Response\nall predictions"| T

    subgraph RESULT["📊 Prediction Result"]
        T["Display Result on UI\n✅ Approved / ❌ Rejected\nApproval Probability %\nModel Confidence %"]
    end
```

---

## 🔄 Single Prediction Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as React Frontend
    participant API as Flask Backend
    participant Model as LoanPredictor

    User->>UI: Fill form & click "Predict Loan Status"
    UI->>API: POST /api/predict (JSON)
    API->>Model: predictor.predict(data)
    Model->>Model: preprocess_data() — encode + scale
    Model->>Model: RandomForest.predict()
    Model-->>API: prediction, probability, confidence
    API-->>UI: JSON response
    UI-->>User: Show Approved/Rejected + %
```

---

## 📦 Project File Structure

```
python_project/
├── 📄 train_u6lujuX_CVtuZ9i.csv       ← Raw training dataset
├── 📄 train_preprocessed.csv           ← Clean dataset (0 missing values)
│
├── backend/
│   ├── app.py                          ← Flask API server (port 5000)
│   ├── model.py                        ← LoanPredictor class (RF model)
│   ├── preprocess_data.py              ← Standalone cleaning script
│   ├── requirements.txt
│   └── models/
│       ├── loan_model.pkl              ← Trained Random Forest
│       ├── scaler.pkl                  ← StandardScaler
│       ├── label_encoders.pkl          ← LabelEncoders
│       └── feature_columns.pkl
│
└── frontend/
    └── src/
        └── components/
            ├── PredictionForm.jsx      ← Single prediction form
            ├── FileUpload.jsx          ← Batch CSV prediction
            ├── Navbar.jsx
            └── Footer.jsx
```

---

## 🧠 ML Model Summary

| Property | Value |
|---|---|
| **Algorithm** | Random Forest Classifier |
| **Trees** | 100 estimators |
| **Max Depth** | 10 |
| **Train/Test Split** | 80% / 20% |
| **Features Used** | 14 (11 original + 3 engineered) |
| **Engineered Features** | TotalIncome, LoanAmountToIncome, EMI |
| **Output** | Approved / Rejected + Probability % |
