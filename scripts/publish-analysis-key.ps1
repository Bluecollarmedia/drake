param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$secretPath = Join-Path $projectRoot '.secrets\analysis.local.json'
$temporaryEnvironmentPath = Join-Path $projectRoot '.secrets\openai-rotation.tmp.env'
$projectReference = 'ndiafbgcsrbptmjzsoeo'

if (-not (Test-Path -LiteralPath $secretPath)) {
    throw 'The locally saved OpenAI key was not found. Run set-analysis-key.ps1 first.'
}

$secret = Get-Content -Raw -LiteralPath $secretPath | ConvertFrom-Json
if ($secret.OPENAI_API_KEY -notmatch '^sk-[A-Za-z0-9_-]+$') {
    throw 'The locally saved OpenAI key is invalid.'
}

try {
    $utf8WithoutBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText(
        $temporaryEnvironmentPath,
        "OPENAI_API_KEY=$($secret.OPENAI_API_KEY)`n",
        $utf8WithoutBom
    )

    Push-Location $projectRoot
    try {
        & npx --yes supabase secrets set --env-file $temporaryEnvironmentPath --project-ref $projectReference
        if ($LASTEXITCODE -ne 0) {
            throw 'Supabase rejected the secret update.'
        }
    }
    finally {
        Pop-Location
    }

    Remove-Item -LiteralPath $secretPath -Force
    Write-Host 'The new OpenAI key is installed on the Supabase server. The local copy was deleted.'
}
finally {
    if (Test-Path -LiteralPath $temporaryEnvironmentPath) {
        Remove-Item -LiteralPath $temporaryEnvironmentPath -Force
    }
    $secret = $null
}
