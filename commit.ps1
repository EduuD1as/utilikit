$ErrorActionPreference = 'SilentlyContinue'

# Mudar para o diretório correto
Set-Location "c:\Users\Suporte\Documents\Dev\utilikit.worktrees\agents-word-to-pdf-converter-enhancements"

Write-Host "=== Verificando Status do Git ===" -ForegroundColor Cyan
& git status --short

Write-Host "`n=== Adicionando Mudanças ===" -ForegroundColor Cyan
& git add -A

Write-Host "`n=== Commitando ===" -ForegroundColor Cyan
$commitMessage = @"
feat: adicionar 3 ferramentas novas e corrigir conversor Word-PDF

Adicionadas:
- Gerador de QR Code (/gerador-qr) com 6 modos
- Utilitários de Texto (/text-utils) com 10 conversores
- Conversor de Unidades (/conversor-unidades) com 6 categorias

Melhorias:
- Corrigido conversor Word-PDF com renderização HTML aprimorada
- Adicionado qrcode.react como dependência
- Adicionado 600+ linhas de CSS para as novas ferramentas
- Atualizado README.md com documentação completa

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
"@

& git commit -m $commitMessage

Write-Host "`n=== Log do Último Commit ===" -ForegroundColor Cyan
& git log --oneline -1

Write-Host "`n=== Status Final ===" -ForegroundColor Cyan
& git status --short
