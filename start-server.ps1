$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = 'C:\Users\admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
$Port = 8032
$Log = Join-Path $Root 'http-server-8032.log'

try {
  "Starting server at $(Get-Date -Format s)" | Out-File -LiteralPath $Log -Encoding utf8
  "Root=$Root" | Out-File -LiteralPath $Log -Append -Encoding utf8
  "Python=$Python" | Out-File -LiteralPath $Log -Append -Encoding utf8
  Set-Location -LiteralPath $Root
  & $Python -m http.server $Port --bind 127.0.0.1 *>> $Log
} catch {
  $_.Exception.ToString() | Out-File -LiteralPath $Log -Append -Encoding utf8
  throw
}
