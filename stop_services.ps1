param (
    [int[]]$Ports = @(5000, 3000)
)

function Kill-Tree {
    param([int]$Id)
    $ppid = 0
    try {
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $Id" -ErrorAction SilentlyContinue
        if ($proc) {
            $ppid = $proc.ParentProcessId
            
            # Kill the process itself
            # Write-Host "Killing Process ID $Id ($($proc.Name))..." -ForegroundColor Yellow
            Stop-Process -Id $Id -Force -ErrorAction SilentlyContinue
            
            # If parent exists, check if it is cmd.exe or distinct from system
            if ($ppid -gt 0) {
                $parentProc = Get-Process -Id $ppid -ErrorAction SilentlyContinue
                if ($parentProc -and $parentProc.ProcessName -eq "cmd") {
                    # Write-Host "Killing Parent CMD Shell (PID $ppid) to close tab..." -ForegroundColor Red
                    Stop-Process -Id $ppid -Force -ErrorAction SilentlyContinue
                }
            }
        }
    } catch {
        # Write-Host "Error processing PID ${Id}: $_" -ForegroundColor Red
    }
}

# Write-Host "Searching for active processes on ports $Ports..." -ForegroundColor Cyan

foreach ($port in $Ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if (-not $connections) {
        continue
    }

    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique

    foreach ($p in $pids) {
        if ($p -gt 0) {
            Kill-Tree -Id $p
        }
    }
}

# Write-Host "Cleanup complete." -ForegroundColor Green
Start-Sleep -Seconds 1
