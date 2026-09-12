# Supervisor loop for the Cloudflare quick tunnel that exposes the app publicly.
# Starts cloudflared, records the public https://<name>.trycloudflare.com URL to
# tunnel-url.txt, and restarts it if it ever drops. Launched hidden at login by
# GardenPlanner-tunnel-autostart.vbs.
#
# NOTE: a quick tunnel's URL CHANGES each time it restarts (crash, reboot, or
# re-login). Read the current one from scripts\tunnel-url.txt (or get-link.bat).
$ErrorActionPreference = 'SilentlyContinue'
$dir     = 'C:\Users\abeem\Documents\garden-planner\scripts'
$cf      = Join-Path $dir 'cloudflared.exe'
$log     = Join-Path $dir 'tunnel.log'
$urlFile = Join-Path $dir 'tunnel-url.txt'

while ($true) {
  Remove-Item $log, "$log.out" -Force -ErrorAction SilentlyContinue
  $p = Start-Process -FilePath $cf `
    -ArgumentList 'tunnel','--no-autoupdate','--url','http://localhost:3001' `
    -WindowStyle Hidden -PassThru `
    -RedirectStandardError $log -RedirectStandardOutput "$log.out"

  # Grab the public URL once cloudflared prints it (usually within a few seconds).
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    $c = (Get-Content $log -Raw -EA SilentlyContinue) + (Get-Content "$log.out" -Raw -EA SilentlyContinue)
    $m = [regex]::Match($c, 'https://[a-z0-9-]+\.trycloudflare\.com')
    if ($m.Success) { Set-Content -Path $urlFile -Value $m.Value -Encoding ascii; break }
  }

  $p.WaitForExit()   # block until the tunnel drops, then restart it
  Start-Sleep -Seconds 3
}
