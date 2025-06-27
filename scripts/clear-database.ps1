# Database cleanup script
Write-Host "Starting database cleanup..." -ForegroundColor Yellow

# Get the absolute path of the current script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath
$backendPath = Join-Path -Path $rootPath -ChildPath "music-app-backend"

# Method 1: Using npm script to clear the database
Write-Host "Switching to backend directory: $backendPath" -ForegroundColor Cyan
Set-Location -Path $backendPath
npm run db:clear

Write-Host "Database cleanup completed!" -ForegroundColor Green
Write-Host "To repopulate data, please run: npm run seed" -ForegroundColor Cyan