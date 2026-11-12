# ==============================================================
# Zoogle Enterprise EMS - PowerShell Launch Script
# ==============================================================

Write-Host "==============================================================" -ForegroundColor DarkRed
Write-Host "             ZOOGLE ENTERPRISE EMS - BACKEND LAUNCHER         " -ForegroundColor Yellow
Write-Host "==============================================================" -ForegroundColor DarkRed

# Locate java and javac
$javacPath = "C:\Program Files\Java\jdk-26.0.2\bin\javac.exe"
$javaPath = "C:\Program Files\Java\jdk-26.0.2\bin\java.exe"

if (-not (Test-Path $javacPath)) {
    $javacCmd = Get-Command javac -ErrorAction SilentlyContinue
    if ($javacCmd) { $javacPath = $javacCmd.Source }
}

if (-not (Test-Path $javaPath)) {
    $javaCmd = Get-Command java -ErrorAction SilentlyContinue
    if ($javaCmd) { $javaPath = $javaCmd.Source }
}

# Ensure bin directory exists
if (-not (Test-Path "bin")) {
    New-Item -ItemType Directory -Path "bin" | Out-Null
}

Write-Host "[1/3] Compiling Java backend sources..." -ForegroundColor Cyan
$javaFiles = Get-ChildItem -Recurse -Filter *.java src | ForEach-Object { $_.FullName }
& $javacPath -d bin $javaFiles

if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation failed! Please check errors." -ForegroundColor Red
    exit 1
}

Write-Host "[2/3] Backend compilation successful!" -ForegroundColor Green
Write-Host "[3/3] Starting Zoogle EMS Server at http://localhost:8080 ..." -ForegroundColor Cyan
Write-Host "--------------------------------------------------------------" -ForegroundColor DarkYellow
Write-Host " Credentials:" -ForegroundColor Yellow
Write-Host "   Admin Portal:    admin / admin123" -ForegroundColor White
Write-Host "   Employee Portal: pooja.sharma / zoogle123" -ForegroundColor White
Write-Host "                    dheeraj.raj / zoogle123" -ForegroundColor White
Write-Host "--------------------------------------------------------------" -ForegroundColor DarkYellow

# Launch default browser after 1.5 seconds in background
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:8080"
} | Out-Null

& $javaPath -cp bin com.zoogle.ems.Server
