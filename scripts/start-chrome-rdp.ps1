# Launch Google Chrome with Remote Debugging Protocol enabled on port 9222
# Usage: powershell -ExecutionPolicy Bypass -File scripts/start-chrome-rdp.ps1

param(
  [int]$Port = 9222
)

$chromeCandidates = @(
  "$Env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "$Env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe",
  "$Env:LocalAppData\Google\Chrome\Application\chrome.exe"
)

$chrome = $chromeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) {
  Write-Host "Could not find Chrome. Please install Chrome or set CHROME_PATH." -ForegroundColor Yellow
  exit 1
}

Start-Process -FilePath $chrome -ArgumentList "--remote-debugging-port=$Port" -WindowStyle Normal
Write-Host "Chrome started with remote debugging on http://localhost:$Port" -ForegroundColor Green
