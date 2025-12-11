<#
set_mcp_api.ps1
Safely insert TESTSPRITE API key into app/mcp.json from env var sk-user-PaYfdgHN2v-NkpUGZX2vRR4wSmJlTl2wUYVH0iF6dhQ2kONct68OhMfE8H60Nc7D7ukvEzRCLYUN2YB9hmWHwRjZsipVWlGjIKOGxZNSDTCuNIwfGXju1jnXHlpOvtoWTDU.
This script validates JSON before and after the replacement and creates a backup
of the original file at app/mcp.json.bak. Do NOT commit the file if it contains
the real API key.
#>

Param()

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$mcpPath = Join-Path $scriptDir 'mcp.json'

if (-not (Test-Path $mcpPath)) {
  Write-Error "File not found: $mcpPath"
  exit 1
}

# ensure original JSON is valid
try {
  Get-Content $mcpPath -Raw | ConvertFrom-Json | Out-Null
} catch {
  Write-Error "Existing mcp.json is not valid JSON: $_"
  exit 2
}

$api = $env:sk-user-PaYfdgHN2v-NkpUGZX2vRR4wSmJlTl2wUYVH0iF6dhQ2kONct68OhMfE8H60Nc7D7ukvEzRCLYUN2YB9hmWHwRjZsipVWlGjIKOGxZNSDTCuNIwfGXju1jnXHlpOvtoWTDU
if (-not $api) {
  Write-Error "Environment variable sk-user-PaYfdgHN2v-NkpUGZX2vRR4wSmJlTl2wUYVH0iF6dhQ2kONct68OhMfE8H60Nc7D7ukvEzRCLYUN2YB9hmWHwRjZsipVWlGjIKOGxZNSDTCuNIwfGXju1jnXHlpOvtoWTDU is not set. Set it before running this script."
  Write-Output "Example: `$env:sk-user-PaYfdgHN2v-NkpUGZX2vRR4wSmJlTl2wUYVH0iF6dhQ2kONct68OhMfE8H60Nc7D7ukvEzRCLYUN2YB9hmWHwRjZsipVWlGjIKOGxZNSDTCuNIwfGXju1jnXHlpOvtoWTDU = 'sk-...'; ./app/set_mcp_api.ps1`"
  exit 3
}

# Load, set, serialize to temp file and validate
$jsonObj = Get-Content $mcpPath -Raw | ConvertFrom-Json

if ($null -eq $jsonObj.servers -or $jsonObj.servers.Count -eq 0) {
  Write-Error "Unexpected mcp.json structure: 'servers' missing or empty."
  exit 4
}

$jsonObj.servers[0].env.API_KEY = $api

$tmp = [IO.Path]::GetTempFileName()
$jsonObj | ConvertTo-Json -Depth 10 | Out-File -FilePath $tmp -Encoding utf8

try {
  Get-Content $tmp -Raw | ConvertFrom-Json | Out-Null
} catch {
  Remove-Item $tmp -Force
  Write-Error "Resulting JSON invalid after inserting API key: $_"
  exit 5
}

# backup and replace
Copy-Item -Path $mcpPath -Destination ($mcpPath + '.bak') -Force
Move-Item -Path $tmp -Destination $mcpPath -Force

Write-Output "API key inserted into $mcpPath (backup at $mcpPath.bak)."
Write-Output "IMPORTANT: Do NOT commit this file to version control. If you accidentally committed a key, revoke/rotate it immediately."
