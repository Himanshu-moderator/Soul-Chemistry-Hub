# Puts PersonaAI online with your Gemini key kept SECRET on Supabase's server.
#
# Before you run this (2 minutes, free):
#   1. Create a project at https://supabase.com (New project). Wait until it is ready.
#   2. Copy its "Project ref": the part of the project URL before .supabase.co
#      (Project Settings > General > Reference ID).
#
# Then, in PowerShell, from the soul-chemistry-hub folder:
#   .\supabase\deploy-persona-ai.ps1
#
# It asks for the project ref and your Gemini key (typing is hidden, nothing is saved to a
# file). It logs you in to Supabase (a browser window opens), stores the key as a server
# secret and publishes the persona-ai function. The key never goes into the app or the repo.

$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

$ref = Read-Host "Supabase project ref"
$secure = Read-Host "Gemini API key" -AsSecureString
$key = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))

Write-Host "`n1/3 Logging in to Supabase (approve it in the browser)..." -ForegroundColor Cyan
npx --yes supabase login

Write-Host "`n2/3 Storing your Gemini key as a server secret..." -ForegroundColor Cyan
npx --yes supabase secrets set "GEMINI_API_KEY=$key" --project-ref $ref

Write-Host "`n3/3 Publishing the persona-ai function..." -ForegroundColor Cyan
npx --yes supabase functions deploy persona-ai --project-ref $ref

$key = $null
Write-Host "`nDone. PersonaAI now answers through your Supabase project." -ForegroundColor Green
Write-Host "Last step: put the project URL and anon key in artifacts/mobile/.env (see .env.example), then rebuild the web app."
