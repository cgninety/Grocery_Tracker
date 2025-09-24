# PowerShell script to stop all Grocery Tracker services

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Grocery Tracker - Service Shutdown" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Stopping Node.js processes..." -ForegroundColor Yellow
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | Stop-Process -Force
        Write-Host "✅ Node.js processes stopped successfully" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No Node.js processes were running" -ForegroundColor Blue
    }
} catch {
    Write-Host "ℹ️  No Node.js processes were running" -ForegroundColor Blue
}

Write-Host ""
Write-Host "Checking for processes using port 3000..." -ForegroundColor Yellow
try {
    $portProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($portProcess) {
        $pid = $portProcess.OwningProcess
        Stop-Process -Id $pid -Force
        Write-Host "✅ Process on port 3000 stopped (PID: $pid)" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  Port 3000 is not in use" -ForegroundColor Blue
    }
} catch {
    Write-Host "ℹ️  Port 3000 is not in use" -ForegroundColor Blue
}

Write-Host ""
Write-Host "Stopping nodemon processes..." -ForegroundColor Yellow
try {
    $nodemonProcesses = Get-Process -Name "nodemon" -ErrorAction SilentlyContinue
    if ($nodemonProcesses) {
        $nodemonProcesses | Stop-Process -Force
        Write-Host "✅ Nodemon processes stopped" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No nodemon processes were running" -ForegroundColor Blue
    }
} catch {
    Write-Host "ℹ️  No nodemon processes were running" -ForegroundColor Blue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🛑 All Grocery Tracker services stopped" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now safely:" -ForegroundColor White
Write-Host "- Close VS Code" -ForegroundColor Gray
Write-Host "- Restart the application" -ForegroundColor Gray
Write-Host "- Shutdown your computer" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to continue..."