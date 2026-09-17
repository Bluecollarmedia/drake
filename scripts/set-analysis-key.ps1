param()
$ErrorActionPreference = 'Stop'
$phase3Root = Split-Path -Parent $PSScriptRoot
$phase3SecureKey = Read-Host 'Enter your OpenAI API key (input is hidden)' -AsSecureString
$phase3Pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($phase3SecureKey)
try {
    $phase3ApiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($phase3Pointer)
    if ($phase3ApiKey -notmatch '^sk-[A-Za-z0-9_-]+$') { throw 'This does not look like an OpenAI API key. Nothing was saved.' }
    $phase3Directory = Join-Path $phase3Root '.secrets'
    New-Item -ItemType Directory -Path $phase3Directory -Force | Out-Null
    $phase3Json = @{ OPENAI_API_KEY = $phase3ApiKey } | ConvertTo-Json
    $phase3Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText((Join-Path $phase3Directory 'analysis.local.json'), $phase3Json, $phase3Utf8NoBom)
    Write-Host 'Analysis key saved locally in the ignored secrets directory. Tell Codex: Saved.'
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($phase3Pointer)
    $phase3ApiKey = $null
    $phase3Json = $null
}
