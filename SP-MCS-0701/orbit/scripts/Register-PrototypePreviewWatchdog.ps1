param(
  [int]$Port = 5174,
  [string]$TaskName = 'OrbitControlPrototypeWatchdog'
)

$ErrorActionPreference = 'Stop'
$starter = Join-Path $PSScriptRoot 'Start-PrototypePreview.ps1'
$powerShell = (Get-Command powershell.exe -ErrorAction Stop).Source
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 2)
$arguments = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$starter`" -Port $Port"
$action = New-ScheduledTaskAction -Execute $powerShell -Argument $arguments
$trigger = New-ScheduledTaskTrigger -AtLogOn
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
Start-ScheduledTask -TaskName $TaskName

Write-Host "Startup check registered: $TaskName. It checks http://127.0.0.1:$Port once when the user signs in and starts the prototype when unavailable."
