# Music App Dependencies Update Script
# Script to update frontend and backend project dependencies

param(
    [switch]$Frontend = $false,
    [switch]$Backend = $false,
    [switch]$All = $false,
    [switch]$Check = $false,
    [switch]$WhatIf = $false,
    [string]$PackageManager = "npm"
)

# Color output function
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Check if package manager is available
function Test-PackageManager {
    param([string]$Manager)
    
    try {
        $null = & $Manager --version 2>$null
        return $true
    } catch {
        return $false
    }
}

# Get project paths
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath
$frontendPath = Join-Path -Path $rootPath -ChildPath "music-app-frontend"
$backendPath = Join-Path -Path $rootPath -ChildPath "music-app-backend"

Write-ColorOutput "=== Music App Dependencies Update Script ===" "Green"
Write-ColorOutput ""

# Parameter validation
if (-not $Frontend -and -not $Backend -and -not $All) {
    Write-ColorOutput "Please specify which project to update:" "Yellow"
    Write-ColorOutput "  -Frontend    Update frontend dependencies" "Cyan"
    Write-ColorOutput "  -Backend     Update backend dependencies" "Cyan"
    Write-ColorOutput "  -All         Update both frontend and backend dependencies" "Cyan"
    Write-ColorOutput ""
    Write-ColorOutput "Other options:" "Yellow"
    Write-ColorOutput "  -Check       Only check for outdated dependencies" "Cyan"
    Write-ColorOutput "  -WhatIf      Preview mode, do not actually update" "Cyan"
    Write-ColorOutput "  -PackageManager <npm|yarn|pnpm>  Specify package manager (default: npm)" "Cyan"
    Write-ColorOutput ""
    Write-ColorOutput "Examples:" "Yellow"
    Write-ColorOutput "  .\update-deps.ps1 -All" "Gray"
    Write-ColorOutput "  .\update-deps.ps1 -Frontend -Check" "Gray"
    Write-ColorOutput "  .\update-deps.ps1 -Backend -PackageManager yarn" "Gray"
    exit 0
}

# Check package manager
if (-not (Test-PackageManager $PackageManager)) {
    Write-ColorOutput "Error: Package manager '$PackageManager' not found or unavailable" "Red"
    Write-ColorOutput "Please ensure $PackageManager is installed or use a different package manager" "Red"
    exit 1
}

Write-ColorOutput "Using package manager: $PackageManager" "Blue"
Write-ColorOutput ""

# Update dependencies function
function Update-ProjectDependencies {
    param(
        [string]$ProjectPath,
        [string]$ProjectName,
        [string]$Manager,
        [bool]$CheckOnly,
        [bool]$DryRun
    )
    
    if (-not (Test-Path $ProjectPath)) {
        Write-ColorOutput "Error: $ProjectName directory does not exist: $ProjectPath" "Red"
        return $false
    }
    
    Write-ColorOutput "=== Processing $ProjectName ===" "Cyan"
    Write-ColorOutput "Path: $ProjectPath" "Gray"
    
    # Switch to project directory
    $originalLocation = Get-Location
    Set-Location $ProjectPath
    
    try {
        if ($CheckOnly) {
            Write-ColorOutput "Checking for outdated dependencies..." "Yellow"
            
            switch ($Manager) {
                "npm" {
                    & npm outdated
                }
                "yarn" {
                    & yarn outdated
                }
                "pnpm" {
                    & pnpm outdated
                }
            }
        } else {
            if ($DryRun) {
                Write-ColorOutput "[Preview Mode] Commands that would be executed:" "Yellow"
            } else {
                Write-ColorOutput "Updating dependencies..." "Yellow"
            }
            
            switch ($Manager) {
                "npm" {
                    $command = "npm update"
                    if ($DryRun) {
                        Write-ColorOutput "  $command" "Gray"
                    } else {
                        Write-ColorOutput "Executing: $command" "Gray"
                        & npm update
                        if ($LASTEXITCODE -eq 0) {
                            Write-ColorOutput "Success: npm update completed" "Green"
                        } else {
                            Write-ColorOutput "Error: npm update failed" "Red"
                            return $false
                        }
                    }
                }
                "yarn" {
                    $command = "yarn upgrade"
                    if ($DryRun) {
                        Write-ColorOutput "  $command" "Gray"
                    } else {
                        Write-ColorOutput "Executing: $command" "Gray"
                        & yarn upgrade
                        if ($LASTEXITCODE -eq 0) {
                            Write-ColorOutput "Success: yarn upgrade completed" "Green"
                        } else {
                            Write-ColorOutput "Error: yarn upgrade failed" "Red"
                            return $false
                        }
                    }
                }
                "pnpm" {
                    $command = "pnpm update"
                    if ($DryRun) {
                        Write-ColorOutput "  $command" "Gray"
                    } else {
                        Write-ColorOutput "Executing: $command" "Gray"
                        & pnpm update
                        if ($LASTEXITCODE -eq 0) {
                            Write-ColorOutput "Success: pnpm update completed" "Green"
                        } else {
                            Write-ColorOutput "Error: pnpm update failed" "Red"
                            return $false
                        }
                    }
                }
            }
            
            if (-not $DryRun) {
                # Audit for security vulnerabilities
                Write-ColorOutput "Checking for security vulnerabilities..." "Yellow"
                switch ($Manager) {
                    "npm" {
                        & npm audit
                        if ($LASTEXITCODE -ne 0) {
                            Write-ColorOutput "Security vulnerabilities found, attempting auto-fix..." "Yellow"
                            & npm audit fix
                        }
                    }
                    "yarn" {
                        & yarn audit
                    }
                    "pnpm" {
                        & pnpm audit
                        if ($LASTEXITCODE -ne 0) {
                            Write-ColorOutput "Security vulnerabilities found, attempting auto-fix..." "Yellow"
                            & pnpm audit --fix
                        }
                    }
                }
            }
        }
        
        Write-ColorOutput "Success: $ProjectName processing completed" "Green"
        Write-ColorOutput ""
        return $true
        
    } catch {
        Write-ColorOutput "Error: Failed to process $ProjectName - $($_.Exception.Message)" "Red"
        return $false
    } finally {
        Set-Location $originalLocation
    }
}

# Execute updates
$success = $true

if ($All -or $Frontend) {
    $result = Update-ProjectDependencies -ProjectPath $frontendPath -ProjectName "Frontend Project" -Manager $PackageManager -CheckOnly $Check -DryRun $WhatIf
    $success = $success -and $result
}

if ($All -or $Backend) {
    $result = Update-ProjectDependencies -ProjectPath $backendPath -ProjectName "Backend Project" -Manager $PackageManager -CheckOnly $Check -DryRun $WhatIf
    $success = $success -and $result
}

# Summary
Write-ColorOutput "=== Update Complete ===" "Green"
if ($Check) {
    Write-ColorOutput "Dependency check completed!" "Blue"
} elseif ($WhatIf) {
    Write-ColorOutput "Preview completed! To actually execute updates, remove the -WhatIf parameter" "Blue"
} else {
    if ($success) {
        Write-ColorOutput "All dependencies updated successfully!" "Green"
        Write-ColorOutput ""
        Write-ColorOutput "Recommended next steps:" "Yellow"
        Write-ColorOutput "1. Test application functionality" "Cyan"
        Write-ColorOutput "2. Run test suites" "Cyan"
        Write-ColorOutput "3. Check for breaking changes" "Cyan"
    } else {
        Write-ColorOutput "Some dependency updates failed, please check error messages" "Red"
        exit 1
    }
}
