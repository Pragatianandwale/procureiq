@echo off
echo Starting ProcureIQ System...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Download spaCy model if not present (skipped due to Python 3.14 compatibility)
REM python -c "import spacy; spacy.load('en_core_web_sm')" 2>nul || (
REM     echo Downloading spaCy model...
REM     python -m spacy download en_core_web_sm
REM )
echo Skipping spaCy model download (Python 3.14 compatibility - using fallback mode)

REM Initialize database
echo Initializing database...
cd backend
python -c "from database import Database; db = Database(); print('Database initialized')"
cd ..

REM Start backend
echo Starting backend server...
start "ProcureIQ Backend" cmd /k "cd backend && python main.py"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Install frontend dependencies if needed
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

REM Start frontend
echo Starting frontend...
start "ProcureIQ Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ProcureIQ is running!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Close the terminal windows to stop the services
pause
