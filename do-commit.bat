@echo off
cd /d C:\Users\Suporte\Documents\Dev\utilikit

git add -A

git commit -m "feat: add theme toggle and 5 new utility tools" ^
  -m "- Implement dark/light theme system with localStorage persistence" ^
  -m "- Add theme context and CSS variables for both themes" ^
  -m "- Add theme toggle button in header with sun/moon icons" ^
  -m "- Improve light theme colors and styling for better UX" ^
  -m "- Create 5 new tools: character counter, calculator, unit converter, QR code generator, UUID/hash generator" ^
  -m "- Add styles for all new tool pages with responsive design" ^
  -m "- Update tools.js with new tools registry" ^
  -m "- Set unit converter precision to 3 decimal places" ^
  -m "- Update App.jsx with new route mappings" ^
  -m "" ^
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

pause
