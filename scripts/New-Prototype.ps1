param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z0-9]+(?:-[a-z0-9]+)*$')]
    [string]$Name,

    [Parameter(Mandatory = $true)]
    [string]$Title,

    [ValidateSet('vue', 'react')]
    [string]$Stack = 'vue'
)

$ErrorActionPreference = 'Stop'
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$docsTemplateRoot = Join-Path $workspaceRoot 'templates\product-docs'
$targetRoot = Join-Path $workspaceRoot $Name

$templateFolder = if ($Stack -eq 'react') {
    'react-vite-shadcn'
} else {
    'vue3-vite-element-plus'
}
$templateRoot = Join-Path $workspaceRoot "templates\$templateFolder"

if (-not (Test-Path -LiteralPath $templateRoot)) {
    throw "Missing app template: $templateRoot"
}

if (Test-Path -LiteralPath $targetRoot) {
    $existingItems = Get-ChildItem -LiteralPath $targetRoot -Force
    if ($existingItems.Count -gt 0) {
        throw "Target directory is not empty: $targetRoot"
    }
} else {
    New-Item -ItemType Directory -Path $targetRoot | Out-Null
}

Get-ChildItem -LiteralPath $templateRoot -Force |
    Where-Object { $_.Name -notin @('node_modules', '.git', 'dist') } |
    Copy-Item -Destination $targetRoot -Recurse

$docsTarget = Join-Path $targetRoot 'docs'
New-Item -ItemType Directory -Path $docsTarget -Force | Out-Null
Copy-Item -Path (Join-Path $docsTemplateRoot '*.md') -Destination $docsTarget

$utf8 = [System.Text.UTF8Encoding]::new($false)
$textFiles = Get-ChildItem -LiteralPath $targetRoot -Recurse -File |
    Where-Object { $_.Extension -in @('.md', '.html', '.json', '.ts', '.tsx', '.vue') }

foreach ($file in $textFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName, $utf8)
    $content = $content.Replace('{{PRODUCT_TITLE}}', $Title)
    $content = $content.Replace('__PRODUCT_TITLE__', $Title)
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8)
}

$packagePath = Join-Path $targetRoot 'package.json'
$package = [System.IO.File]::ReadAllText($packagePath, $utf8) | ConvertFrom-Json
$package.name = $Name
$packageJson = $package | ConvertTo-Json -Depth 20
[System.IO.File]::WriteAllText($packagePath, $packageJson, $utf8)

Push-Location $targetRoot
try {
    & git init -b main
    if ($LASTEXITCODE -ne 0) { throw 'git init failed.' }

    & npm.cmd install
    if ($LASTEXITCODE -ne 0) { throw 'npm install failed.' }

    & npm.cmd run lint
    if ($LASTEXITCODE -ne 0) { throw 'Initial lint failed.' }

    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw 'Initial build failed.' }

    & git add .
    & git commit -m "Initialize $Stack prototype"
    if ($LASTEXITCODE -ne 0) { throw 'Initial git commit failed.' }
} finally {
    Pop-Location
}

Write-Host "Created: $Title"
Write-Host "Stack: $Stack"
Write-Host "Directory: $targetRoot"
Write-Host "Start: cd '$targetRoot'; npm.cmd run dev"
