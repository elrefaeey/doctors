$maxRetries = 10
$retryCount = 0
$success = $false

Write-Host "Attempting to push to GitHub..." -ForegroundColor Yellow
Write-Host "This may take several attempts due to network issues." -ForegroundColor Yellow
Write-Host ""

while (-not $success -and $retryCount -lt $maxRetries) {
    $retryCount++
    Write-Host "Attempt $retryCount of $maxRetries..." -ForegroundColor Cyan
    
    $result = git push origin final-push:main --force 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $success = $true
        Write-Host "Success! Code pushed to GitHub." -ForegroundColor Green
        break
    }
    
    if ($result -match "Everything up-to-date") {
        Write-Host "Repository is up-to-date! Checking remote..." -ForegroundColor Green
        git ls-remote --heads origin
        $success = $true
        break
    }
    
    Write-Host "Failed. Waiting 5 seconds before retry..." -ForegroundColor Red
    Start-Sleep -Seconds 5
}

if (-not $success) {
    Write-Host ""
    Write-Host "Failed after $maxRetries attempts." -ForegroundColor Red
    Write-Host "Please try one of these alternatives:" -ForegroundColor Yellow
    Write-Host "1. GitHub Desktop: https://desktop.github.com/" -ForegroundColor White
    Write-Host "2. GitHub CLI: gh repo create elrefaeey/doctor --public --source=. --push" -ForegroundColor White
    Write-Host "3. Try from a different network connection" -ForegroundColor White
}
