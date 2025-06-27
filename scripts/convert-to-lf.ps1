# PowerShell script to convert CRLF to LF in text files
param(
    [string]$Path = ".",
    [switch]$WhatIf = $false
)

# Define file extensions to process
$textExtensions = @(
    "*.ts", "*.js", "*.tsx", "*.jsx", "*.json", "*.md", "*.txt", 
    "*.yml", "*.yaml", "*.xml", "*.html", "*.css", "*.scss", 
    "*.sass", "*.less", "*.sql", "*.py", "*.php", "*.rb", 
    "*.go", "*.java", "*.cs", "*.vb", "*.c", "*.h", "*.cpp", 
    "*.hpp", "*.sh", "*.bat", "*.cmd", "*.ps1", "*.gitignore", 
    "*.gitattributes", "*.env*", "Dockerfile*", "*.conf", "*.config"
)

# Directories to exclude
$excludeDirs = @("node_modules", ".git", "dist", "build", "coverage", ".next", ".nuxt")

Write-Host "Converting CRLF to LF in text files..." -ForegroundColor Green
Write-Host "Path: $Path" -ForegroundColor Yellow
if ($WhatIf) {
    Write-Host "WhatIf mode: No files will be modified" -ForegroundColor Yellow
}

$processedCount = 0
$convertedCount = 0

foreach ($extension in $textExtensions) {
    $files = Get-ChildItem -Path $Path -Filter $extension -Recurse -File | Where-Object {
        $exclude = $false
        foreach ($excludeDir in $excludeDirs) {
            if ($_.FullName -like "*\$excludeDir\*" -or $_.FullName -like "*/$excludeDir/*") {
                $exclude = $true
                break
            }
        }
        return -not $exclude
    }
    
    foreach ($file in $files) {
        $processedCount++
        
        try {
            # Read file content as bytes to preserve encoding
            $content = [System.IO.File]::ReadAllBytes($file.FullName)
            
            # Check if file contains CRLF
            $hasCRLF = $false
            for ($i = 0; $i -lt $content.Length - 1; $i++) {
                if ($content[$i] -eq 13 -and $content[$i + 1] -eq 10) { # CR LF
                    $hasCRLF = $true
                    break
                }
            }
            
            if ($hasCRLF) {
                Write-Host "Converting: $($file.FullName)" -ForegroundColor Cyan
                
                if (-not $WhatIf) {
                    # Read as text and replace CRLF with LF
                    $textContent = [System.IO.File]::ReadAllText($file.FullName)
                    $convertedContent = $textContent -replace "`r`n", "`n"
                    
                    # Write back with UTF-8 encoding (no BOM)
                    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
                    [System.IO.File]::WriteAllText($file.FullName, $convertedContent, $utf8NoBom)
                }
                
                $convertedCount++
            }
        }
        catch {
            Write-Warning "Error processing file $($file.FullName): $($_.Exception.Message)"
        }
    }
}

Write-Host "`nConversion completed!" -ForegroundColor Green
Write-Host "Files processed: $processedCount" -ForegroundColor Yellow
Write-Host "Files converted: $convertedCount" -ForegroundColor Yellow

if ($WhatIf) {
    Write-Host "`nTo actually convert the files, run the script without -WhatIf parameter" -ForegroundColor Magenta
}
