"""
Data Preprocessing Script for Loan Prediction Dataset
This script handles missing values and prepares the data for model training.
"""

import pandas as pd
import numpy as np
import os
from datetime import datetime

def analyze_data(df):
    """Analyze the dataset for missing values and basic statistics"""
    print("="*60)
    print("DATA ANALYSIS REPORT")
    print("="*60)
    print(f"\nDataset Shape: {df.shape}")
    print(f"Total Records: {len(df)}")
    
    print("\n" + "-"*60)
    print("MISSING VALUES ANALYSIS")
    print("-"*60)
    missing = df.isnull().sum()
    missing_pct = (missing / len(df) * 100).round(2)
    
    missing_df = pd.DataFrame({
        'Column': missing.index,
        'Missing Count': missing.values,
        'Missing %': missing_pct.values
    })
    missing_df = missing_df[missing_df['Missing Count'] > 0].sort_values('Missing %', ascending=False)
    
    if len(missing_df) > 0:
        print(missing_df.to_string(index=False))
    else:
        print("No missing values found!")
    
    print("\n" + "-"*60)
    print("DATA TYPES")
    print("-"*60)
    print(df.dtypes)
    
    print("\n" + "-"*60)
    print("TARGET VARIABLE DISTRIBUTION")
    print("-"*60)
    if 'Loan_Status' in df.columns:
        print(df['Loan_Status'].value_counts())
        print(f"\nApproval Rate: {(df['Loan_Status'] == 'Y').sum() / len(df) * 100:.2f}%")
    
    return missing_df

def preprocess_data(df, verbose=True):
    """
    Preprocess the loan dataset by handling missing values
    
    Strategy:
    - Categorical variables: Fill with mode (most frequent value)
    - Numerical variables: Fill with median
    - Credit_History: Fill with 1.0 (most common and safer assumption)
    """
    df = df.copy()
    
    if verbose:
        print("\n" + "="*60)
        print("PREPROCESSING DATA")
        print("="*60)
    
    # Store original missing counts
    original_missing = df.isnull().sum()
    
    # 1. Handle Gender - Fill with mode
    if df['Gender'].isnull().sum() > 0:
        mode_gender = df['Gender'].mode()[0]
        df['Gender'] = df['Gender'].fillna(mode_gender)
        if verbose:
            print(f"\n✓ Gender: Filled {original_missing['Gender']} missing values with '{mode_gender}'")
    
    # 2. Handle Married - Fill with mode
    if df['Married'].isnull().sum() > 0:
        mode_married = df['Married'].mode()[0]
        df['Married'] = df['Married'].fillna(mode_married)
        if verbose:
            print(f"✓ Married: Filled {original_missing['Married']} missing values with '{mode_married}'")
    
    # 3. Handle Dependents - Fill with mode
    if df['Dependents'].isnull().sum() > 0:
        mode_dependents = df['Dependents'].mode()[0]
        df['Dependents'] = df['Dependents'].fillna(mode_dependents)
        if verbose:
            print(f"✓ Dependents: Filled {original_missing['Dependents']} missing values with '{mode_dependents}'")
    
    # 4. Handle Self_Employed - Fill with mode
    if df['Self_Employed'].isnull().sum() > 0:
        mode_self_employed = df['Self_Employed'].mode()[0]
        df['Self_Employed'] = df['Self_Employed'].fillna(mode_self_employed)
        if verbose:
            print(f"✓ Self_Employed: Filled {original_missing['Self_Employed']} missing values with '{mode_self_employed}'")
    
    # 5. Handle LoanAmount - Fill with median
    if df['LoanAmount'].isnull().sum() > 0:
        median_loan = df['LoanAmount'].median()
        df['LoanAmount'] = df['LoanAmount'].fillna(median_loan)
        if verbose:
            print(f"✓ LoanAmount: Filled {original_missing['LoanAmount']} missing values with median {median_loan}")
    
    # 6. Handle Loan_Amount_Term - Fill with mode (360 is most common)
    if df['Loan_Amount_Term'].isnull().sum() > 0:
        mode_term = df['Loan_Amount_Term'].mode()[0]
        df['Loan_Amount_Term'] = df['Loan_Amount_Term'].fillna(mode_term)
        if verbose:
            print(f"✓ Loan_Amount_Term: Filled {original_missing['Loan_Amount_Term']} missing values with mode {mode_term}")
    
    # 7. Handle Credit_History - Fill with 1.0 (safer assumption for loan approval)
    if df['Credit_History'].isnull().sum() > 0:
        df['Credit_History'] = df['Credit_History'].fillna(1.0)
        if verbose:
            print(f"✓ Credit_History: Filled {original_missing['Credit_History']} missing values with 1.0")
    
    # Verify no missing values remain
    remaining_missing = df.isnull().sum().sum()
    
    if verbose:
        print("\n" + "-"*60)
        if remaining_missing == 0:
            print("✓ SUCCESS: All missing values have been handled!")
        else:
            print(f"⚠ WARNING: {remaining_missing} missing values still remain")
            print(df.isnull().sum()[df.isnull().sum() > 0])
    
    return df

def save_preprocessed_data(df, output_path, verbose=True):
    """Save the preprocessed data to a CSV file"""
    df.to_csv(output_path, index=False)
    if verbose:
        print(f"\n✓ Preprocessed data saved to: {output_path}")
        print(f"  - Total records: {len(df)}")
        print(f"  - File size: {os.path.getsize(output_path) / 1024:.2f} KB")

def main():
    """Main preprocessing pipeline"""
    # File paths
    input_file = 'train_u6lujuX_CVtuZ9i.csv'
    output_file = 'train_preprocessed.csv'
    
    print("\n" + "="*60)
    print("LOAN PREDICTION DATA PREPROCESSING")
    print("="*60)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Input File: {input_file}")
    print(f"Output File: {output_file}")
    
    # Load data
    print("\n📂 Loading data...")
    df = pd.read_csv(input_file)
    print(f"✓ Loaded {len(df)} records")
    
    # Analyze data
    missing_df = analyze_data(df)
    
    # Preprocess data
    df_clean = preprocess_data(df, verbose=True)
    
    # Save preprocessed data
    save_preprocessed_data(df_clean, output_file, verbose=True)
    
    # Final summary
    print("\n" + "="*60)
    print("PREPROCESSING COMPLETE!")
    print("="*60)
    print(f"✓ Original records: {len(df)}")
    print(f"✓ Cleaned records: {len(df_clean)}")
    print(f"✓ Records removed: 0 (all records retained)")
    print(f"✓ Output file: {output_file}")
    print("\nNext steps:")
    print("1. Review the preprocessed data")
    print("2. Train the model using: python backend/model.py")
    print("="*60)

if __name__ == "__main__":
    main()
