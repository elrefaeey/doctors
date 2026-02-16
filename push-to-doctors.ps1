$maxRetries = 10
$retryCount = 0
$success = $false

Write-Host "Pushing to GitHub doctors repository..." -ForegroundColor Yellow
Write-Host ""

while (-not $success -and $retryCount -lt $maxRetries) {
    $retryCount++
    Write-Host "Attempt $retryCount of $maxRetries..." -ForegroundColor Cyan
    
    $result = git push doctors final-push:main --force 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $success = $true
        Write-Host "Success! Code pushed to GitHub doctors repository." -ForegroundColor Green
        break
    }
    
    if ($result -match "Everything up-to-date") {
        Write-Host "Repository is up-to-date!" -ForegroundColor Green
        git ls-remote --heads doctors
        $success = $true
        break
    }
    
    Write-Host "Failed. Waiting 5 seconds before retry..." -ForegroundColor Red
    Start-Sleep -Seconds 5
}

if (-not $success) {
    Write-Host ""
    Write-Host "Failed after $maxRetries attempts." -ForegroundColor Red
}
