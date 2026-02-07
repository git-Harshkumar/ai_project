#!/usr/bin/env bash
# Build script for Render deployment

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Checking for trained model..."
if [ ! -f "models/loan_model.pkl" ]; then
    echo "No trained model found. Training model..."
    python model.py
else
    echo "Model already exists. Skipping training."
fi

echo "Build completed successfully!"
