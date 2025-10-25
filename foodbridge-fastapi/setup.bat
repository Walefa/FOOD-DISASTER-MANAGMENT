@echo off
echo Setting up Climate Resilience & Food Security Platform...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH!
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo Installing dependencies...
pip install -r requirements.txt

REM Copy environment file
if not exist ".env" (
    if exist ".env.example" (
        echo Copying environment configuration...
        copy .env.example .env
        echo Please edit .env file with your configuration before running the server
    )
)

echo.
echo Setup completed successfully!
echo.
echo To start the development server:
echo 1. Activate virtual environment: venv\Scripts\activate
echo 2. Run: uvicorn app.main:app --reload
echo 3. Open http://localhost:8000/docs for API documentation
echo.
pause