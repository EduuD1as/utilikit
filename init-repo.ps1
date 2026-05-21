# Inicializa o repositório Git do UtiliKit (rode na pasta do projeto)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
  Write-Host 'Git não encontrado. Instale: https://git-scm.com/download/win' -ForegroundColor Red
  exit 1
}

if (Test-Path .git) {
  Write-Host 'Repositório Git já existe em' (Resolve-Path .git)
  & git status
  exit 0
}

& git init
& git add .
& git commit -m "Initial commit: UtiliKit hub de ferramentas"
Write-Host ''
Write-Host 'Repositório criado com sucesso em' $PSScriptRoot -ForegroundColor Green
& git log -1 --oneline
