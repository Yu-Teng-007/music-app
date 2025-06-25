# Database cleanup script
Write-Host "Starting database cleanup..." -ForegroundColor Yellow

# Get the absolute path of the current script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path -Path $scriptPath -ChildPath "music-app-backend"

# Method 1: Using npm script to clear the database
Write-Host "Switching to backend directory: $backendPath" -ForegroundColor Cyan
Set-Location -Path $backendPath
npm run db:clear

# Method 2: Directly using MySQL command to clear the database
# If you have MySQL client installed, you can uncomment the following code to use this method
<# 
$mysqlUser = "root"
$mysqlPassword = "123456"
$mysqlHost = "localhost"
$mysqlDatabase = "music_app"

# Create temporary SQL file
$tempSqlFile = [System.IO.Path]::GetTempFileName()
@"
DROP DATABASE IF EXISTS $mysqlDatabase;
CREATE DATABASE $mysqlDatabase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"@ | Out-File -FilePath $tempSqlFile -Encoding utf8

# Execute SQL command
mysql -u $mysqlUser -p"$mysqlPassword" -h $mysqlHost < $tempSqlFile

# Delete temporary file
Remove-Item -Path $tempSqlFile
#>

Write-Host "Database cleanup completed!" -ForegroundColor Green
Write-Host "To repopulate data, please run: npm run seed" -ForegroundColor Cyan