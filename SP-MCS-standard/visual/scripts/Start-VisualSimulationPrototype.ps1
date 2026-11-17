$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$logDirectory = Join-Path $env:LOCALAPPDATA 'SP-MCS'
$logPath = Join-Path $logDirectory 'visual-simulation-prototype-startup.log'

New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null

try {
  $listener = Get-NetTCPConnection -LocalPort 5175 -State Listen -ErrorAction SilentlyContinue
  if ($listener) {
    Add-Content -Path $logPath -Value "$(Get-Date -Format s) 5175 is already available; skipped startup."
    exit 0
  }

  $npm = (Get-Command npm.cmd -ErrorAction Stop).Source
  Start-Process -FilePath $npm -ArgumentList 'run', 'dev', '--', '--host', '0.0.0.0' -WorkingDirectory $projectRoot -WindowStyle Hidden
  Add-Content -Path $logPath -Value "$(Get-Date -Format s) Started visual-simulation-prototype on 0.0.0.0:5175."
}
catch {
  Add-Content -Path $logPath -Value "$(Get-Date -Format s) Startup failed: $($_.Exception.Message)"
  exit 1
}
