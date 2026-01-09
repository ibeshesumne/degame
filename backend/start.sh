#!/bin/bash
# Start script for backend server

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run the backend server
python -m src
