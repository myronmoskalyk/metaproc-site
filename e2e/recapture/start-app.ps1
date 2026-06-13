# Recapture harness: start metaproc natively on Windows as a tracked background
# process, then wait until http://127.0.0.1:7991 is serving. Writes the PID to app.pid.
# Kills anything already on 7991 first. (Adapted from metaproc-deploy/e2e/palette-start-app.ps1;
# Rscript path fixed to the R-4.5.1 install that is present on this machine.)
$ErrorActionPreference = 'Stop'
$port = 7991
$rscript = 'C:\Program Files\R\R-4.5.1\bin\Rscript.exe'
$runner = 'C:\dev\metaproc-site\e2e\recapture\run-app.R'
$pidFile = 'C:\dev\metaproc-site\e2e\recapture\app.pid'
$logFile = 'C:\dev\metaproc-site\e2e\recapture\app.log'

# 1) Kill any existing listener on the port.
$existing = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $existing) {
  if ($procId) { Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue }
}
Start-Sleep -Milliseconds 500

# 2) Launch the app detached, redirecting output to a log we can inspect on failure.
$p = Start-Process -FilePath $rscript -ArgumentList @($runner) `
  -RedirectStandardOutput $logFile -RedirectStandardError "$logFile.err" `
  -WindowStyle Hidden -PassThru
$p.Id | Out-File -FilePath $pidFile -Encoding ascii

# 3) Poll the port for readiness (up to ~180s; first compile/load_all is slow).
$ready = $false
for ($i = 0; $i -lt 180; $i++) {
  Start-Sleep -Seconds 1
  if ($p.HasExited) { Write-Output "APP_EXITED_EARLY pid=$($p.Id)"; break }
  try {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conn) { $ready = $true; break }
  } catch {}
}
if ($ready) { Write-Output "APP_READY pid=$($p.Id) after ${i}s" }
else        { Write-Output "APP_NOT_READY pid=$($p.Id)" }
