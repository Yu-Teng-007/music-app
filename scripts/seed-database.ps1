# Database seeding script
Write-Host "Starting database seeding..." -ForegroundColor Yellow

# Get the absolute path of the current script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath
$backendPath = Join-Path -Path $rootPath -ChildPath "music-app-backend"

# Switch to backend directory and run seed command
Write-Host "Switching to backend directory: $backendPath" -ForegroundColor Cyan
Set-Location -Path $backendPath
npm run seed

Write-Host "Database seeding completed!" -ForegroundColor Green 