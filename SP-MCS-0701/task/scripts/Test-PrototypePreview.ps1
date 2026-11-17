param(
  [int]$Port = 5173
)

$ErrorActionPreference = 'Stop'
$previewUrl = "http://127.0.0.1:$Port/app/mccs/tasksys/task/schedule"

try {
  $response = Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 $previewUrl
  if ($response.StatusCode -ne 200 -or $response.Content -notmatch '<div id="app">') {
    throw "Unexpected response from $previewUrl"
  }
  Write-Host "HEALTHY $previewUrl"
  exit 0
} catch {
  Write-Error "UNAVAILABLE $previewUrl - $($_.Exception.Message)"
  exit 1
}
