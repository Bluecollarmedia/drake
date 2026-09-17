param([Parameter(ValueFromRemainingArguments = $true)][string[]]$CliArguments)
$ErrorActionPreference = 'Stop'
$phase2Root = Split-Path -Parent $PSScriptRoot
$phase2SecretPath = Join-Path $phase2Root '.secrets/supabase.local.json'
$phase2PreviousPassword = $env:SUPABASE_DB_PASSWORD
$phase2ExitCode = 0
Push-Location $phase2Root
try {
    if (Test-Path -LiteralPath $phase2SecretPath) {
        $phase2Secrets = Get-Content -Raw -LiteralPath $phase2SecretPath | ConvertFrom-Json
        $env:SUPABASE_DB_PASSWORD = $phase2Secrets.SUPABASE_DB_PASSWORD
    }
    & npx --yes supabase @CliArguments
    $phase2ExitCode = $LASTEXITCODE
}
finally {
    $env:SUPABASE_DB_PASSWORD = $phase2PreviousPassword
    $phase2Secrets = $null
    Pop-Location
}
exit $phase2ExitCode
