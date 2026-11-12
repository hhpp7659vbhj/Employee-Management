@echo off
title Zoogle Enterprise EMS Server
color 4F

echo ==============================================================
echo          ZOOGLE ENTERPRISE EMS - BACKEND LAUNCHER
echo ==============================================================

set "JAVA_BIN=C:\Program Files\Java\jdk-26.0.2\bin"
if exist "%JAVA_BIN%\javac.exe" (
    set "JAVAC=%JAVA_BIN%\javac.exe"
    set "JAVA=%JAVA_BIN%\java.exe"
) else (
    set "JAVAC=javac"
    set "JAVA=java"
)

if not exist "bin" mkdir "bin"

echo [1/3] Compiling Java backend sources...
powershell -NoProfile -Command "$files = Get-ChildItem -Recurse -Filter *.java src | ForEach-Object { $_.FullName }; & '%JAVAC%' -d bin $files"

if errorlevel 1 (
    echo [ERROR] Compilation failed.
    pause
    exit /b 1
)

echo [2/3] Compilation successful!
echo [3/3] Starting Zoogle EMS Server at http://localhost:8080 ...
echo --------------------------------------------------------------
echo  Admin Credentials:    admin / admin123
echo  Employee Credentials: pooja.sharma / zoogle123
echo                        dheeraj.raj / zoogle123
echo --------------------------------------------------------------

start "" http://localhost:8080
"%JAVA%" -cp bin com.zoogle.ems.Server

pause
