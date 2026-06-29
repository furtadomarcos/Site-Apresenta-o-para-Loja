param(
  [string]$Version = "22.12.0"
)

$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$toolsDir = Join-Path $projectRoot ".tools"

$nodeArch = "x64"
if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64" -or $env:PROCESSOR_ARCHITEW6432 -eq "ARM64") {
  $nodeArch = "arm64"
}

$nodeName = "node-v$Version-win-$nodeArch"
$nodeDir = Join-Path $toolsDir $nodeName
$nodeExe = Join-Path $nodeDir "node.exe"

if (Test-Path $nodeExe) {
  Write-Host "Node.js portatil ja esta pronto: $nodeDir"
  exit 0
}

New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null

$zipPath = Join-Path ([System.IO.Path]::GetTempPath()) "$nodeName.zip"
$downloadUrl = "https://nodejs.org/dist/v$Version/$nodeName.zip"

if (Test-Path $zipPath) {
  Remove-Item -Force $zipPath
}

Write-Host "Baixando Node.js $Version ($nodeArch)..."
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath

Write-Host "Extraindo Node.js..."
Expand-Archive -Path $zipPath -DestinationPath $toolsDir -Force
Remove-Item -Force $zipPath

if (-not (Test-Path $nodeExe)) {
  throw "Node.js nao foi encontrado apos a extracao: $nodeExe"
}

Write-Host "Node.js portatil pronto: $nodeDir"
