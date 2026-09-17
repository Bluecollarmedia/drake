param([switch]$ResumeAfterEvaluation)
$ErrorActionPreference = 'Stop'
$phase4Root = Split-Path -Parent $PSScriptRoot
$phase4SecretJson = Join-Path $phase4Root '.secrets/analysis.local.json'
$phase4EdgeEnv = Join-Path $phase4Root '.secrets/phase4-edge.env'
Push-Location $phase4Root
try {
    if (-not (Test-Path -LiteralPath $phase4SecretJson)) { throw 'The ignored OpenAI server secret is missing.' }
    if (-not $ResumeAfterEvaluation) {
        Write-Host '1/6 Applying the additive Phase 4 database migration...'
        & (Join-Path $PSScriptRoot 'supabase.ps1') db push --include-all
        if ($LASTEXITCODE -ne 0) { throw 'Database migration failed.' }

        Write-Host '2/6 Generating or resuming current-version catalog embeddings...'
        & npm run recommendation:embed
        if ($LASTEXITCODE -ne 0) { throw 'Embedding generation failed.' }

        Write-Host '3/6 Running calibration and adversarial recommendation evaluation...'
        & npm run recommendation:evaluate
        if ($LASTEXITCODE -ne 0) { throw 'Evaluation found a quality failure. The report was preserved; do not deploy yet.' }
    }
    else {
        $phase4EvaluationPath = Join-Path $phase4Root 'artifacts/recommendations/evaluation-report.json'
        if (-not (Test-Path -LiteralPath $phase4EvaluationPath)) { throw 'A completed evaluation report is required before deployment.' }
        $phase4Evaluation = Get-Content -LiteralPath $phase4EvaluationPath -Raw | ConvertFrom-Json
        if ($phase4Evaluation.summary.total -ne 12 -or $phase4Evaluation.summary.failed -ne 0) { throw 'The latest full evaluation suite has not passed.' }
        Write-Host '1-3/6 Using the completed migration, embeddings, and passing 12-case evaluation.'
    }

    Write-Host '4/6 Verifying embedding completeness and client security boundaries...'
    & npm run recommendation:verify
    if ($LASTEXITCODE -ne 0) { throw 'Recommendation security verification failed.' }

    Write-Host '5/6 Configuring the existing OpenAI key as a server-only Edge Function secret...'
    $phase4Secret = Get-Content -LiteralPath $phase4SecretJson -Raw | ConvertFrom-Json
    if ($phase4Secret.OPENAI_API_KEY -notmatch '^sk-[A-Za-z0-9_-]+$') { throw 'The ignored OpenAI server secret is invalid.' }
    [IO.File]::WriteAllText($phase4EdgeEnv, "OPENAI_API_KEY=$($phase4Secret.OPENAI_API_KEY)`n", [Text.UTF8Encoding]::new($false))
    & (Join-Path $PSScriptRoot 'supabase.ps1') secrets set --env-file $phase4EdgeEnv
    if ($LASTEXITCODE -ne 0) { throw 'Edge Function secret configuration failed.' }

    Write-Host '6/6 Deploying the authenticated recommendation endpoint...'
    & (Join-Path $PSScriptRoot 'supabase.ps1') functions deploy recommend
    if ($LASTEXITCODE -ne 0) { throw 'Recommendation endpoint deployment failed.' }
    Write-Host 'Phase 4 live run and endpoint deployment completed.'
}
finally {
    if (Test-Path -LiteralPath $phase4EdgeEnv) { Remove-Item -LiteralPath $phase4EdgeEnv -Force }
    $phase4Secret = $null
    Pop-Location
}
