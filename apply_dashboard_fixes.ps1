# PowerShell script to apply Doctor Dashboard improvements

$filePath = "src/pages/DoctorDashboard.tsx"
$content = Get-Content $filePath -Raw

Write-Host "Applying Doctor Dashboard improvements..." -ForegroundColor Cyan

# Add helper function before return statement
$helperFunction = @"
    // Helper to calculate remaining days
    const getRemainingDays = () => {
        if (!doctorData?.subscription?.endDate) return 0;
        const end = doctorData.subscription.endDate.toDate();
        const now = new Date();
        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    const hasActiveSubscription = doctorData?.subscription?.status === 'active' && getRemainingDays() > 0;

    return (
"@

$content = $content -replace "return \(", $helperFunction

Write-Host "Added helper functions" -ForegroundColor Green

# Save the file
Set-Content $filePath $content -NoNewline

Write-Host "Dashboard improvements applied successfully!" -ForegroundColor Green
