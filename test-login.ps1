# PowerShell script to test admin login
# Usage: .\test-login.ps1

$email = "admin@gmail.com"
$password = "admin123"
$apiBase = "http://localhost:3000/api"

Write-Host "🧪 Testing Admin Login..." -ForegroundColor Cyan
Write-Host ""

# Login
Write-Host "1. Logging in as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$apiBase/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    if ($loginResponse.success) {
        Write-Host "   ✅ Login successful!" -ForegroundColor Green
        Write-Host "   👤 User: $($loginResponse.user.displayName)" -ForegroundColor Cyan
        Write-Host "   📋 Role: $($loginResponse.user.role)" -ForegroundColor Cyan
        Write-Host "   🔑 Token: $($loginResponse.token.Substring(0, 30))..." -ForegroundColor Gray
        Write-Host ""

        $token = $loginResponse.token

        # Test admin endpoint
        Write-Host "2. Testing admin endpoint (dashboard stats)..." -ForegroundColor Yellow
        try {
            $headers = @{
                "Authorization" = "Bearer $token"
            }

            $statsResponse = Invoke-RestMethod -Uri "$apiBase/admin/dashboard/stats" `
                -Method Get `
                -Headers $headers

            if ($statsResponse.success) {
                Write-Host "   ✅ Admin endpoint accessible!" -ForegroundColor Green
                Write-Host "   📊 Total Users: $($statsResponse.stats.totalUsers)" -ForegroundColor Cyan
                Write-Host "   📊 Total Employees: $($statsResponse.stats.totalEmployees)" -ForegroundColor Cyan
                Write-Host "   📊 Total Subscriptions: $($statsResponse.stats.totalSubscriptions)" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "   ❌ Error accessing admin endpoint: $($_.Exception.Message)" -ForegroundColor Red
        }

        Write-Host ""
        Write-Host "✅ Test completed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "💡 To use this token in other requests:" -ForegroundColor Yellow
        Write-Host "   Authorization: Bearer $($token.Substring(0, 30))..." -ForegroundColor Gray
        Write-Host ""
        Write-Host "Example cURL command:" -ForegroundColor Yellow
        Write-Host "   curl http://localhost:3000/api/admin/dashboard/stats \`" -ForegroundColor Gray
        Write-Host "     -H `"Authorization: Bearer $token`"" -ForegroundColor Gray

    } else {
        Write-Host "   ❌ Login failed: $($loginResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   - Make sure the server is running: npm run dev" -ForegroundColor Gray
    Write-Host "   - Check that user exists in Firebase Auth" -ForegroundColor Gray
    Write-Host "   - Verify user document exists in Firestore with role='admin'" -ForegroundColor Gray
}

