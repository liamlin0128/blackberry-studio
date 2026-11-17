param(
  [int]$Port = 5173
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$previewUrl = "http://127.0.0.1:$Port/app/mccs/tasksys/task/schedule"
$viteEntry = Join-Path $projectRoot 'node_modules\vite\bin\vite.js'
$runtimeDirectory = Join-Path $projectRoot 'logs'
$pidFile = Join-Path $runtimeDirectory 'prototype-preview.pid'
$stdoutLog = Join-Path $runtimeDirectory 'prototype-preview.stdout.log'
$stderrLog = Join-Path $runtimeDirectory 'prototype-preview.stderr.log'

function Test-PreviewHealth {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 $previewUrl
    return $response.StatusCode -eq 200 -and $response.Content -match '<div id="app">'
  } catch {
    return $false
  }
}

if (Test-PreviewHealth) {
  Write-Host "Prototype preview is already available: $previewUrl"
  exit 0
}

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($listener) { throw "Port $Port is occupied by process $($listener.OwningProcess), but the prototype health check failed."
}

if (-not (Test-Path $viteEntry)) {
  throw 'Vite is not installed. Run npm.cmd install before starting the preview.'
}

New-Item -ItemType Directory -Path $runtimeDirectory -Force | Out-Null
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
$process = Start-Process `
  -FilePath $nodePath `
  -ArgumentList @($viteEntry, '--host', '0.0.0.0', '--port', $Port, '--strictPort') `
  -WorkingDirectory $projectRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput $stdoutLog `
  -RedirectStandardError $stderrLog `
  -PassThru

for ($attempt = 0; $attempt -lt 40; $attempt += 1) {
  if ($process.HasExited) {
    throw 'Prototype preview exited before becoming ready.'
  }
  if (Test-PreviewHealth) {
    Set-Content -Encoding ascii -Path $pidFile -Value $process.Id
    Write-Host "Prototype preview started in an independent background process (PID $($process.Id)): $previewUrl"
    exit 0
  }
  Start-Sleep -Milliseconds 250
}

throw 'Prototype preview did not become healthy within 10 seconds.'
