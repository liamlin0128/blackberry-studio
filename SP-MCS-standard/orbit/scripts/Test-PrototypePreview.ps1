param(
  [int]$Port = 5174
)

$ErrorActionPreference = 'Stop'
$previewUrl = "http://127.0.0.1:$Port/"

try {
  $response = Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 $previewUrl
} catch {
  throw "Prototype preview is unavailable: $previewUrl"
}

if ($response.StatusCode -ne 200 -or $response.Content -notmatch '<div id="root">') {
  throw "Prototype preview health check failed: $previewUrl"
}

Write-Host "Prototype preview is healthy: $previewUrl"
