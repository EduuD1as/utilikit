@echo off
cd /d "c:\Users\Suporte\Documents\Dev\utilikit.worktrees\agents-word-to-pdf-converter-enhancements"
echo === Git Status ===
git status --short
echo.
echo === Committing changes ===
git add -A
git commit -m "feat: adicionar 3 ferramentas novas (QR Code, Text Utils, Unit Converter) e corrigir conversor Word-PDF" -m "- Gerador de QR Code com 6 modos (URL, Email, Telefone, WiFi, VCard, Texto)
- Utilitarios de Texto com contador e 10 conversores (maiusculas, minusculas, capitalizado, etc)
- Conversor de Unidades com 6 categorias e ~40 unidades
- Corrigido conversor Word-PDF com melhor renderizacao HTML e paginacao
- Adicionado qrcode.react como dependencia
- Adicionado CSS para todas as novas ferramentas
- Atualizado README.md com documentacao das novas ferramentas

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
echo.
echo === Log ===
git log --oneline -1
