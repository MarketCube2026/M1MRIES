$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = 'C:\Users\admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
$Server = Join-Path $Root 'excel_server.py'
$Log = Join-Path $Root 'excel_server.log'
$Port = 8036

function Test-Server {
  try {
    $response = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$Port/api/health" -TimeoutSec 2
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

if (Test-Server) {
  "[$(Get-Date -Format s)] Server already running on port $Port" | Out-File -LiteralPath $Log -Append -Encoding utf8
  exit 0
}

Set-Location -LiteralPath $Root
"[$(Get-Date -Format s)] Starting Excel sync server" | Out-File -LiteralPath $Log -Append -Encoding utf8

$process = Start-Process -FilePath $Python -ArgumentList @($Server) -WorkingDirectory $Root -WindowStyle Hidden -PassThru
"[$(Get-Date -Format s)] Started process PID=$($process.Id)" | Out-File -LiteralPath $Log -Append -Encoding utf8

Start-Sleep -Seconds 2
if (Test-Server) {
  "[$(Get-Date -Format s)] Server health check passed on port $Port" | Out-File -LiteralPath $Log -Append -Encoding utf8
  exit 0
}

"[$(Get-Date -Format s)] Server health check failed after start" | Out-File -LiteralPath $Log -Append -Encoding utf8
exit 1
