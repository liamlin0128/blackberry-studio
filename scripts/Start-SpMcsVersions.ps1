$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $root 'preview-logs'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

foreach ($edition in @('standard', '0701')) {
  $port = if ($edition -eq '0701') { 5273 } else { 5173 }
  $directory = Join-Path $root "SP-MCS-$edition"
  if (-not (Test-Path -LiteralPath (Join-Path $directory 'server.mjs'))) { throw "Missing edition: $directory" }
  foreach ($system in @('task', 'orbit', 'visual', 'resource')) {
    if (-not (Test-Path -LiteralPath (Join-Path $directory "$system\dist\index.html"))) {
      throw "Build missing: $edition/$system. Run npm run build in $directory"
    }
  }
  try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:$port/__spmcs/health" -TimeoutSec 2
  } catch { $health = $null }
  if ($health -and $health.edition -eq $edition) {
    Write-Output "Already running: http://127.0.0.1:$port/"
    continue
  }
  $client = New-Object Net.Sockets.TcpClient
  try { $client.Connect('127.0.0.1', $port); $occupied = $true }
  catch { $occupied = $false }
  finally { $client.Dispose() }
  if ($occupied) { throw "Port $port is occupied by another service. Stop it before starting $edition." }
  $node = (Get-Command node.exe -ErrorAction Stop).Source
  Start-Process -FilePath $node -ArgumentList 'server.mjs' -WorkingDirectory $directory -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $logDir "$edition.out.log") `
    -RedirectStandardError (Join-Path $logDir "$edition.err.log") | Out-Null
  Start-Sleep -Milliseconds 500
  $health = Invoke-RestMethod -Uri "http://127.0.0.1:$port/__spmcs/health" -TimeoutSec 2
  if ($health.edition -ne $edition) { throw "Failed to start $edition on port $port" }
  Write-Output "Started: http://127.0.0.1:$port/"
}
