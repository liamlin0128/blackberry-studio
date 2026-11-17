param(
  [int]$Port = 5173,
  [string]$TaskName = 'TaskPlanningPrototypeWatchdog'
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$starter = Join-Path $PSScriptRoot 'Start-PrototypePreview.ps1'
$powerShell = (Get-Command powershell.exe -ErrorAction Stop).Source
$arguments = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$starter`" -Port $Port"

& schtasks.exe /Create /TN $TaskName /TR "`"$powerShell`" $arguments" /SC ONLOGON /F
if ($LASTEXITCODE -ne 0) { throw "Unable to register scheduled task: $TaskName" }

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 2)
Set-ScheduledTask -TaskName $TaskName -Settings $settings | Out-Null

& schtasks.exe /Run /TN $TaskName
if ($LASTEXITCODE -ne 0) { throw "Scheduled task was registered but could not be started: $TaskName" }

Write-Host "Startup check registered: $TaskName. It checks http://127.0.0.1:$Port once when the user signs in and starts the prototype when unavailable."
