# Music App Development Environment Startup Script (PowerShell)

Write-Host "Starting Music App Development Environment..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js Version: $nodeVersion" -ForegroundColor Blue
} catch {
    Write-Host "Error: Node.js not found, please install Node.js first" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check project directories
if (-not (Test-Path "..\music-app-frontend")) {
    Write-Host "Error: Frontend project directory music-app-frontend not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path "..\music-app-backend")) {
    Write-Host "Error: Backend project directory music-app-backend not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check and install frontend dependencies
if (-not (Test-Path "..\music-app-frontend\node_modules")) {
    Write-Host "Frontend dependencies not installed, installing..." -ForegroundColor Yellow
    Set-Location "..\music-app-frontend"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Frontend dependency installation failed" -ForegroundColor Red
        Set-Location "..\scripts"
        Read-Host "Press Enter to exit"
        exit 1
    }
    Set-Location "..\scripts"
    Write-Host "Frontend dependencies installed successfully" -ForegroundColor Green
}

# Check and install backend dependencies
if (-not (Test-Path "..\music-app-backend\node_modules")) {
    Write-Host "Backend dependencies not installed, installing..." -ForegroundColor Yellow
    Set-Location "..\music-app-backend"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Backend dependency installation failed" -ForegroundColor Red
        Set-Location "..\scripts"
        Read-Host "Press Enter to exit"
        exit 1
    }
    Set-Location "..\scripts"
    Write-Host "Backend dependencies installed successfully" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting backend service..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ..\music-app-backend; npm run start:dev" -WindowStyle Normal

# Wait for backend to start
Start-Sleep -Seconds 3

Write-Host "Starting frontend service..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ..\music-app-frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Development environment started successfully!" -ForegroundColor Green
Write-Host "Frontend URL: http://localhost:5188" -ForegroundColor Blue
Write-Host "Backend URL: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "Press Enter to close this window..." -ForegroundColor Yellow
Read-Host
