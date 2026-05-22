# UtiliKit

Hub de ferramentas online — calculadoras, conversores, geradores e contadores. Interface moderna em React com backend Node.js.

## Ferramentas

| Ferramenta | Rota | Status |
|------------|------|--------|
| Página inicial | `/` | Disponível |
| Contador de inscritos YouTube | `/contador-youtube` | Disponível |
| Formatador de SQL | `/formatador-sql` | Disponível |
| Formatador de JSON | `/formatador-json` | Disponível |
| Conversor de Documentos (Word ↔ PDF) | `/conversor-documentos` | Disponível |
| Conversor de moedas | `/conversor-moedas` | Disponível |
| Gerador de QR Code | `/gerador-qr` | ✨ Novo |
| Utilitários de Texto | `/text-utils` | ✨ Novo |
| Conversor de Unidades | `/conversor-unidades` | ✨ Novo |

## Pré-requisitos

- **Node.js** 18+
- **Git** (para versionamento)

## Configuração

```bash
cd c:\Users\edu-b\projects\utilikit

npm run install:all
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:3001

## Produção

```bash
npm run install:all
npm run build
npm run start
```

Abra **http://localhost:3001** — o Express serve o React e a API.

## Privacidade (LGPD)

- Política de Privacidade: `/privacidade`
- Termos de Uso: `/termos`
- Banner de cookies com opções **Aceitar todos**, **Apenas essenciais** e **Personalizar**
- Scripts de publicidade (AdSense) só carregam após consentimento — configure `VITE_ADSENSE_CLIENT` em `client/.env` quando aprovado

Atualize o e-mail de contato em `client/src/data/legal.js`.

## Tecnologia

- **YouTube**: Dados em tempo real via [SocialCounts API](https://socialcounts.org/) com resolução de handles/nomes por scraping
- **Frontend**: React 18 + Vite + CSS moderno
- **Backend**: Node.js + Express + SSE para atualizações em tempo real

## Como usar o Contador de Inscritos

O contador aceita qualquer um dos formatos abaixo:

✅ **Nome do canal:** `MrBeast`  
✅ **Handle com @:** `@MrBeast`  
✅ **URL com handle:** `https://www.youtube.com/@MrBeast`  
✅ **ID do canal:** `UCX6OQ9DkcsbYNE6H8uQQuVA`  
✅ **URL com ID:** `https://www.youtube.com/channel/UCX6OQ9DkcsbYNE6H8uQQuVA`  

Todos os formatos funcionam igualmente bem!

## 🆕 Novas Ferramentas

### Conversor de Documentos (Melhorado)
- ✅ **Word → PDF**: Converte documentos .docx, .doc, .odt para PDF
- ✅ **PDF → Word**: Extrai conteúdo de PDFs e cria documento Word
- ✅ **Rota**: `/conversor-documentos`
- ✨ **Melhorias**: Renderização HTML aprimorada, melhor paginação, qualidade aumentada

### Gerador de QR Code
- 🔗 **URL**: Crie QR codes para qualquer link
- ✉️ **Email**: Gere QR codes que abrem o cliente de email
- 📱 **Telefone**: Crie QR codes para chamar números
- 📶 **WiFi**: Compartilhe credenciais WiFi via QR code
- 👤 **Contato VCard**: Distribua informações de contato
- 📥 **Download**: Exporte em PNG
- **Rota**: `/gerador-qr`

### Utilitários de Texto
- 📊 **Contador**: Caracteres, palavras, linhas, parágrafos, sentenças
- 🔄 **Conversores**:
  - MAIÚSCULAS / minúsculas / Capitalizado / Title Case
  - Caso Inverso (iNVERTIDO)
  - Reverter texto
  - Remover espaços duplicados
  - Remover acentos
  - Slug (URL-friendly)
- 📋 **Copy-to-clipboard**: Copie resultado em um clique
- **Rota**: `/text-utils`

### Conversor de Unidades
- 📏 **Comprimento**: mm, cm, m, km, polegadas, pés, jardas, milhas
- ⚖️ **Peso**: mg, g, kg, toneladas, onças, libras, stones
- 🌡️ **Temperatura**: Celsius, Fahrenheit, Kelvin
- 💨 **Velocidade**: m/s, km/h, mph, nós
- 🥤 **Volume**: ml, litros, galões, onças fluidas
- 📐 **Área**: mm², cm², m², km², hectares, acres
- ⇅ **Swap**: Inverta as unidades com um clique
- **Rota**: `/conversor-unidades`

## Estrutura

```
utilikit/
├── client/     # React + Vite (home + ferramentas)
├── server/     # Express + YouTube API + SSE
├── package.json
└── .env.example
```
