# Deploys the latest published image on the mini-PC.
#
#   .\deploy.ps1
#
# Pulls the image CI built, runs any new migrations, and only then swaps the
# running container. The migration step is a deliberate gate: if it fails the
# script stops, leaving the previous version serving against a schema it
# understands rather than starting new code against a half-migrated database.

$ErrorActionPreference = 'Stop'

# PowerShell does not treat a non-zero exit code from a native command as an
# error, so every docker call has to be checked by hand.
function Invoke-Checked {
    param([string]$What, [string[]]$DockerArgs)

    Write-Host "`n==> $What" -ForegroundColor Cyan
    & docker @DockerArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nFAILED: $What (exit $LASTEXITCODE)" -ForegroundColor Red
        Write-Host 'Nothing was swapped; the previous version is still running.' -ForegroundColor Yellow
        exit 1
    }
}

Set-Location -Path $PSScriptRoot

if (-not (Test-Path '.env.prod')) {
    Write-Host 'No .env.prod found. Copy .env.prod.example and fill it in.' -ForegroundColor Red
    exit 1
}

$compose = @('compose', '-f', 'docker-compose.prod.yml', '--env-file', '.env.prod')

Invoke-Checked 'Pulling the latest image' ($compose + @('pull'))

# Run from /app/server so node-pg-migrate finds ./migrations, and read the
# connection string straight from the environment. Invoked directly rather than
# through npm to avoid argument-forwarding differences between npm versions.
Invoke-Checked 'Running database migrations' (
    $compose + @('run', '--rm', '-w', '/app/server', 'api', 'npx', 'node-pg-migrate', 'up')
)

Invoke-Checked 'Starting the new version' ($compose + @('up', '-d'))

Invoke-Checked 'Current state' ($compose + @('ps'))

Write-Host "`nDeployed." -ForegroundColor Green
