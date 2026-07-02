$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host ""
Write-Host "KromaOS - Connexion OpenAI locale" -ForegroundColor Magenta
Write-Host "Colle ta cle OpenAI ci-dessous. Elle sera stockee uniquement dans .env, ignore par Git." -ForegroundColor Gray
Write-Host ""

$secureKey = Read-Host "OPENAI_API_KEY" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
try {
  $plainKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

if ([string]::IsNullOrWhiteSpace($plainKey)) {
  Write-Host "Aucune cle renseignee. Rien n'a ete modifie." -ForegroundColor Yellow
  Read-Host "Appuie sur Entree pour fermer"
  exit 1
}

$envPath = Join-Path $root ".env"
$existingLines = @()
if (Test-Path $envPath) {
  $existingLines = Get-Content $envPath | Where-Object {
    $_ -notmatch '^\s*OPENAI_API_KEY\s*=' -and $_ -notmatch '^\s*OPENAI_MODEL\s*='
  }
}

$newLines = @($existingLines) + @(
  "OPENAI_API_KEY=$plainKey",
  "OPENAI_MODEL=gpt-5.5"
)
$newLines | Set-Content -Path $envPath -Encoding UTF8

[Environment]::SetEnvironmentVariable("OPENAI_API_KEY", $plainKey, "User")
[Environment]::SetEnvironmentVariable("OPENAI_MODEL", "gpt-5.5", "User")

$connections = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
foreach ($owningProcess in ($connections | Select-Object -ExpandProperty OwningProcess -Unique)) {
  $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$owningProcess" -ErrorAction SilentlyContinue
  if ($processInfo -and $processInfo.CommandLine -match 'server\.js') {
    Stop-Process -Id $owningProcess -Force
  }
}

Start-Sleep -Milliseconds 500
Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $root -WindowStyle Hidden
Start-Sleep -Seconds 2

$status = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/jarvis/status" -Method Get
if ($status.configured) {
  Write-Host ""
  Write-Host "Jarvis ChatGPT est connecte sur http://localhost:3000/" -ForegroundColor Green
} else {
  Write-Host ""
  Write-Host "Le serveur tourne, mais la cle n'a pas ete detectee." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Appuie sur Entree pour fermer"
