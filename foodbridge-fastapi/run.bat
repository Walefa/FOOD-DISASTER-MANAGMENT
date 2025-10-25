@echo off
echo Starting Climate Resilience & Food Security Platform...

REM Check if virtual environment exists
if not exist "venv" (
    echo Virtual environment not found! Run setup.bat first.
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if .env exists
if not exist ".env" (
    echo Environment file not found! Please copy .env.example to .env and configure it.
    pause
    exit /b 1
)

REM Start the FastAPI server
echo Starting FastAPI server...
echo Open http://localhost:8000/docs for API documentation
echo Press Ctrl+C to stop the server
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000