# Recapture harness: stop the tracked metaproc app process (and anything left on 7991).
# (Adapted verbatim from metaproc-deploy/e2e/palette-stop-app.ps1.)
$ErrorActionPreference = 'SilentlyContinue'
$port = 7991
$pidFile = 'C:\dev\metaproc-site\e2e\recapture\app.pid'
if (Test-Path $pidFile) {
  $appPid = (Get-Content $pidFile | Select-Object -First 1).Trim()
  if ($appPid) {
    # Kill the Rscript process tree (R may spawn child R sessions).
    taskkill /PID $appPid /T /F 2>$null | Out-Null
  }
  Remove-Item $pidFile -Force
}
# Belt-and-suspenders: kill any remaining listener on the port.
$existing = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $existing) {
  if ($procId) { Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue }
}
Start-Sleep -Milliseconds 400
Write-Output "STOPPED"
