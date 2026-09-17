$ErrorActionPreference = 'Stop'
$phase2Root = Split-Path -Parent $PSScriptRoot
$phase2SecretsDirectory = Join-Path $phase2Root '.secrets'
$phase2SecretsFile = Join-Path $phase2SecretsDirectory 'supabase.local.json'
$phase2SecurePassword = Read-Host 'Enter your Supabase DATABASE password (input is hidden)' -AsSecureString
try {
    $phase2Password = [System.Net.NetworkCredential]::new('', $phase2SecurePassword).Password
    if ([string]::IsNullOrWhiteSpace($phase2Password)) { throw 'No password entered. Nothing was saved.' }
    New-Item -ItemType Directory -Path $phase2SecretsDirectory -Force | Out-Null
    @{ SUPABASE_DB_PASSWORD = $phase2Password } | ConvertTo-Json | Set-Content -LiteralPath $phase2SecretsFile -Encoding UTF8
    Write-Host 'Database password saved locally. You can tell Codex: Saved.'
}
finally {
    $phase2Password = $null
    $phase2SecurePassword.Dispose()
}
