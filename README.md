# UtiliKit

Ferramentas rápidas para desenvolvedores e para o dia a dia, direto no navegador.
Quase tudo roda localmente: o que você cola ou digita não sai do seu computador.

https://utilikit.com.br

## Ferramentas

**Desenvolvimento**

- Formatador de SQL: 16 dialetos (incluindo Firebird, PostgreSQL, MySQL, SQL Server e Oracle), formatação automática enquanto digita, minificação, erro com linha e coluna e troca automática de dialeto quando o escolhido não entende a consulta.
- Formatador de JSON: validação com posição do erro, indentação configurável, ordenação de chaves, minificação e escape como string.
- Base64 e URL: codifica e decodifica texto (Base64, Base64 URL-safe e URL) e converte arquivos em data URL.
- Decodificador JWT: header, payload, datas de emissão e expiração e status do token.
- Conversor de timestamp: Unix em segundos ou milissegundos para data local, UTC e ISO 8601, e o caminho inverso.
- Contador de caracteres: caracteres, palavras, frases, linhas, bytes, tempo de leitura e transformações de texto.

**Geradores**

- UUID e hash: UUID v4 e v7, strings aleatórias e hashes MD5, SHA-1, SHA-256, SHA-384 e SHA-512 de texto ou arquivo.
- Gerador de senha: senhas e PINs com aleatoriedade criptográfica, entropia e tempo estimado de quebra.
- Gerador de QR Code: links, textos e redes Wi-Fi, com download em PNG ou SVG.

**Conversores**

- Conversor de unidades: 12 categorias, de comprimento a consumo de combustível.
- Conversor de moedas: taxas de referência do Banco Central Europeu via [Frankfurter](https://frankfurter.dev).

**Calculadoras**

- Calculadora com teclado, porcentagem e histórico.
- Calculadora de porcentagem.
- Juros compostos com aportes mensais e tabela ano a ano.
- Calculadora de IMC com as faixas da OMS.

**Outros**

- Timer Pomodoro com ciclos automáticos e aviso sonoro.
- Roleta sorteadora.
- Jogo da memória.

## Stack

- Front-end: React 18 e Vite 6, sem framework de UI. Tema claro e escuro, português e inglês, busca rápida com `Ctrl+K`.
- Back-end: Express, que entrega o build do front-end e faz proxy com cache para a API de câmbio.
- Bibliotecas principais: `sql-formatter`, `highlight.js` e `qrcode`.

## Rodando localmente

Requer Node.js 20 ou mais recente.

```bash
npm install
npm run install:all
npm run dev
```

O front-end abre em http://localhost:5173 e o servidor em http://localhost:3001.
Em desenvolvimento, o Vite encaminha `/api` para o servidor.

Build de produção:

```bash
npm run build
npm run start --prefix server
```

O servidor passa a entregar `client/dist` e responde qualquer rota com o `index.html`.

## Variáveis de ambiente

| Variável | Onde | Uso |
| --- | --- | --- |
| `PORT` | servidor | Porta do Express (padrão 3001). |
| `CLIENT_ORIGIN` | servidor | Origem permitida no CORS (opcional). |
| `VITE_ADSENSE_CLIENT` | cliente | ID do AdSense. Só carrega após consentimento de cookies de publicidade. |
| `VITE_API_URL` | cliente | URL da API quando o front-end roda separado do servidor (opcional). |

Veja `.env.example` e `client/.env.example`.

## Estrutura

```
client/
  src/
    components/   Shell, editor de código, paleta de comandos e componentes de UI
    context/      preferências (tema e idioma), consentimento, rotas e toasts
    data/         catálogo de ferramentas
    i18n/         textos em português e inglês
    lib/          lógica das ferramentas (SQL, JSON, hash, unidades, câmbio...)
    pages/        uma página por ferramenta
server/
  src/            Express e proxy de câmbio
```

## Deploy

O `render.yaml` configura um serviço web no Render que instala as dependências, gera o build e inicia o servidor.
