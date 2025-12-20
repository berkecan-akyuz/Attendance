@echo off
setlocal enableextensions

:: Set Environment Variables
set "DATABASE_URL=mssql+pyodbc://@OSWIN/ATTENDANCE?driver=ODBC+Driver+18+for+SQL+Server&trusted_connection=yes&TrustServerCertificate=yes"

:menu
cls
echo ==========================================
echo       ATTENDANCE SYSTEM LAUNCHER
echo ==========================================
echo 1. Start App (Backend + Frontend)
echo 2. Terminate Processes
echo 3. Restart App
echo 4. Run Tests...
echo 5. Exit
echo ==========================================
set /p choice=Enter selection (1-5): 

if "%choice%"=="1" goto run_app
if "%choice%"=="2" goto stop_app
if "%choice%"=="3" goto restart_app
if "%choice%"=="4" goto test_menu
if "%choice%"=="5" goto end
goto menu

:test_menu
cls
echo ==========================================
echo           UNIT TEST MENU
echo ==========================================
echo 1. Run ALL Tests
echo 2. Student Form Tests
echo 3. Course Form Tests
echo 4. Enrollment Form Tests
echo 5. Back to Main Menu
echo ==========================================
set /p tchoice=Enter selection (1-5): 

if "%tchoice%"=="1" set "TEST_CMD=npm test" & goto launch_test
if "%tchoice%"=="2" set "TEST_CMD=npx vitest run ../tests/StudentForm.test.tsx" & goto launch_test
if "%tchoice%"=="3" set "TEST_CMD=npx vitest run ../tests/CourseForm.test.tsx" & goto launch_test
if "%tchoice%"=="4" set "TEST_CMD=npx vitest run ../tests/EnrollmentForm.test.tsx" & goto launch_test
if "%tchoice%"=="5" goto menu
goto test_menu

:launch_test
echo.
echo Launching Test: %TEST_CMD%
where wt >nul 2>nul
if %errorlevel% equ 0 (
    echo Opening Tests in new Windows Terminal tab...
    wt -w 0 nt -d "%~dp0\ui" --title "Tests" cmd /k "%TEST_CMD%"
) else (
    echo Windows Terminal not found. Running tests in this window...
    cd ui
    call %TEST_CMD%
    cd ..
    pause
)
goto test_menu

:run_app
echo.
echo Starting Backend + Frontend...
call :launch_wt_or_start
goto menu_pause

:stop_app
powershell -ExecutionPolicy Bypass -File "%~dp0stop_services.ps1" >nul 2>&1
goto menu_pause

:restart_app
echo.
echo Restarting Application...
powershell -ExecutionPolicy Bypass -File "%~dp0stop_services.ps1"
timeout /t 2 >nul
echo Starting Backend + Frontend...
call :launch_wt_or_start
goto menu_pause

:launch_wt_or_start
where wt >nul 2>nul
if %errorlevel% equ 0 (
    echo Opening in Windows Terminal tabs...
    wt -w 0 nt -d "%~dp0\backend" --title "Backend" cmd /k "title AG_Backend && python app.py" ; nt -d "%~dp0\ui" --title "Frontend" cmd /k "title AG_Frontend && npm run dev"
) else (
    echo Windows Terminal not found, opening in separate windows...
    start "Attendance Backend" cmd /k "cd backend && title AG_Backend && python app.py"
    start "Attendance Frontend" cmd /k "cd ui && title AG_Frontend && npm run dev"
)
goto :eof

:menu_pause
echo.
echo Action completed. Press any key to return to menu...
pause >nul
goto menu

:end
echo Exiting launcher...
endlocal
exit /b 0
