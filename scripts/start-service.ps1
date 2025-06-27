# Music App Development Environment Startup Script (PowerShell)

param(
    [switch]$Frontend = $false,
    [switch]$Backend = $false,
    [switch]$All = $false,
    [switch]$Kill = $false,
    [switch]$Help = $false
)

# Color output function
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Function to find and kill processes by port
function Stop-ServiceByPort {
    param(
        [int]$Port,
        [string]$ServiceName
    )

    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($processes) {
            $validProcesses = $processes | Where-Object { $_ -gt 0 -and $_ -ne 4 }  # Exclude system processes
            if ($validProcesses) {
                foreach ($processId in $validProcesses) {
                    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                    if ($process -and $process.ProcessName -ne "System" -and $process.ProcessName -ne "Idle") {
                        Write-ColorOutput "Stopping existing $ServiceName service (PID: $processId, Process: $($process.ProcessName))" "Yellow"
                        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                        Start-Sleep -Seconds 2
                    }
                }
                Write-ColorOutput "Existing $ServiceName service stopped" "Green"
                return $true
            }
        }
    } catch {
        # Port not in use or error occurred
    }
    return $false
}

# Function to kill all node processes (alternative method)
function Stop-NodeProcesses {
    param([string]$ServiceType)

    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if ($nodeProcesses) {
            Write-ColorOutput "Found $($nodeProcesses.Count) Node.js processes, stopping them..." "Yellow"
            $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 3
            Write-ColorOutput "Node.js processes stopped" "Green"
            return $true
        }
    } catch {
        # No node processes found or error occurred
    }
    return $false
}

# Show help information
if ($Help -or (-not $Frontend -and -not $Backend -and -not $All -and -not $Kill)) {
    Write-ColorOutput "=== Music App Development Environment Startup Script ===" "Green"
    Write-ColorOutput ""
    Write-ColorOutput "Usage:" "Yellow"
    Write-ColorOutput "  -Frontend    Start only frontend service" "Cyan"
    Write-ColorOutput "  -Backend     Start only backend service" "Cyan"
    Write-ColorOutput "  -All         Start both frontend and backend services" "Cyan"
    Write-ColorOutput "  -Kill        Kill all running services" "Cyan"
    Write-ColorOutput "  -Help        Show this help message" "Cyan"
    Write-ColorOutput ""
    Write-ColorOutput "Examples:" "Yellow"
    Write-ColorOutput "  .\start-service.ps1 -All" "Gray"
    Write-ColorOutput "  .\start-service.ps1 -Frontend" "Gray"
    Write-ColorOutput "  .\start-service.ps1 -Backend" "Gray"
    Write-ColorOutput "  .\start-service.ps1 -Kill" "Gray"
    Write-ColorOutput ""
    Write-ColorOutput "Service URLs:" "Yellow"
    Write-ColorOutput "  Frontend: http://localhost:5188" "Blue"
    Write-ColorOutput "  Backend:  http://localhost:3000" "Blue"
    exit 0
}

Write-ColorOutput "=== Music App Development Environment Startup Script ===" "Green"
Write-ColorOutput ""

# Handle kill option
if ($Kill) {
    Write-ColorOutput "Stopping all services..." "Yellow"

    # Stop services by port
    $frontendStopped = Stop-ServiceByPort -Port 5188 -ServiceName "Frontend"
    $backendStopped = Stop-ServiceByPort -Port 3000 -ServiceName "Backend"

    # Alternative: stop all node processes
    if (-not $frontendStopped -and -not $backendStopped) {
        Stop-NodeProcesses -ServiceType "All"
    }

    Write-ColorOutput "All services stopped!" "Green"
    exit 0
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-ColorOutput "Node.js Version: $nodeVersion" "Blue"
} catch {
    Write-ColorOutput "Error: Node.js not found, please install Node.js first" "Red"
    Read-Host "Press Enter to exit"
    exit 1
}

# Get script and project paths
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath
$frontendPath = Join-Path -Path $rootPath -ChildPath "music-app-frontend"
$backendPath = Join-Path -Path $rootPath -ChildPath "music-app-backend"

Write-ColorOutput "Script path: $scriptPath" "Gray"
Write-ColorOutput "Root path: $rootPath" "Gray"

# Check project directories based on what we need to start
if ($All -or $Frontend) {
    if (-not (Test-Path $frontendPath)) {
        Write-ColorOutput "Error: Frontend project directory not found at: $frontendPath" "Red"
        Write-ColorOutput "Please ensure the script is run from the correct location" "Red"
        Read-Host "Press Enter to exit"
        exit 1
    }
}

if ($All -or $Backend) {
    if (-not (Test-Path $backendPath)) {
        Write-ColorOutput "Error: Backend project directory not found at: $backendPath" "Red"
        Write-ColorOutput "Please ensure the script is run from the correct location" "Red"
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Function to install dependencies
function Install-Dependencies {
    param(
        [string]$ProjectPath,
        [string]$ProjectName
    )

    if (-not (Test-Path "$ProjectPath\node_modules")) {
        Write-ColorOutput "$ProjectName dependencies not installed, installing..." "Yellow"
        $currentLocation = Get-Location
        Set-Location $ProjectPath
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "Error: $ProjectName dependency installation failed" "Red"
            Set-Location $currentLocation
            Read-Host "Press Enter to exit"
            exit 1
        }
        Set-Location $currentLocation
        Write-ColorOutput "$ProjectName dependencies installed successfully" "Green"
    }
}

# Install dependencies based on what we need to start
if ($All -or $Frontend) {
    Install-Dependencies -ProjectPath $frontendPath -ProjectName "Frontend"
}

if ($All -or $Backend) {
    Install-Dependencies -ProjectPath $backendPath -ProjectName "Backend"
}

# Stop existing services before starting new ones
Write-ColorOutput ""
if ($All -or $Backend) {
    Write-ColorOutput "Checking for existing backend service..." "Yellow"
    Stop-ServiceByPort -Port 3000 -ServiceName "Backend"
}

if ($All -or $Frontend) {
    Write-ColorOutput "Checking for existing frontend service..." "Yellow"
    Stop-ServiceByPort -Port 5188 -ServiceName "Frontend"
}

# Start services
Write-ColorOutput ""
if ($All -or $Backend) {
    Write-ColorOutput "Starting backend service..." "Cyan"
    $backendCommand = "cd '$backendPath'; npm run start:dev"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand -WindowStyle Normal

    if ($All) {
        # Wait for backend to start before starting frontend
        Write-ColorOutput "Waiting for backend to initialize..." "Gray"
        Start-Sleep -Seconds 5
    }
}

if ($All -or $Frontend) {
    Write-ColorOutput "Starting frontend service..." "Cyan"
    $frontendCommand = "cd '$frontendPath'; npm run dev"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand -WindowStyle Normal
}

# Summary
Write-ColorOutput ""
Write-ColorOutput "Development environment started successfully!" "Green"

if ($All -or $Frontend) {
    Write-ColorOutput "Frontend URL: http://localhost:5188" "Blue"
}
if ($All -or $Backend) {
    Write-ColorOutput "Backend URL: http://localhost:3000" "Blue"
}

Write-ColorOutput ""
Write-ColorOutput "Service management commands:" "Yellow"
Write-ColorOutput "  Stop all services: .\start-service.ps1 -Kill" "Cyan"
Write-ColorOutput "  Restart frontend: .\start-service.ps1 -Frontend" "Cyan"
Write-ColorOutput "  Restart backend: .\start-service.ps1 -Backend" "Cyan"
Write-ColorOutput ""
Write-ColorOutput "Press Enter to close this window..." "Yellow"
Read-Host
