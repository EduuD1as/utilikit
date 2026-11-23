import { lazy } from 'react';

/**
 * Registro único das ferramentas. A ordem aqui define a ordem na barra
 * lateral, na página inicial e na paleta de comandos.
 * Nome e descrição vêm de `tools.<id>.name` / `tools.<id>.desc` nas traduções.
 */
export const CATEGORIES = ['dev', 'generators', 'converters', 'calculators', 'productivity', 'fun'];

export const TOOLS = [
  {
    id: 'sql',
    path: '/formatador-sql',
    category: 'dev',
    icon: 'database',
    keywords: 'sql query beautify minify firebird postgres mysql oracle',
    component: lazy(() => import('../pages/SqlFormatterPage.jsx')),
  },
  {
    id: 'json',
    path: '/formatador-json',
    category: 'dev',
    icon: 'braces',
    keywords: 'json validate validar minify beautify',
    component: lazy(() => import('../pages/JsonFormatterPage.jsx')),
  },
  {
    id: 'encoder',
    path: '/codificador-base64',
    category: 'dev',
    icon: 'binary',
    keywords: 'base64 url encode decode codificar decodificar percent',
    component: lazy(() => import('../pages/EncoderPage.jsx')),
  },
  {
    id: 'jwt',
    path: '/decodificador-jwt',
    category: 'dev',
    icon: 'key',
    keywords: 'jwt token json web token decode header payload',
    component: lazy(() => import('../pages/JwtDecoderPage.jsx')),
  },
  {
    id: 'timestamp',
    path: '/conversor-timestamp',
    category: 'dev',
    icon: 'clock',
    keywords: 'unix epoch timestamp data date iso 8601',
    component: lazy(() => import('../pages/TimestampPage.jsx')),
  },
  {
    id: 'text',
    path: '/contador-caracteres',
    category: 'dev',
    icon: 'text',
    keywords: 'contador caracteres palavras linhas word count bytes',
    component: lazy(() => import('../pages/TextCounterPage.jsx')),
  },
  {
    id: 'hash',
    path: '/gerador-id-hash',
    category: 'generators',
    icon: 'hash',
    keywords: 'uuid guid hash sha256 sha1 sha512 md5 random string',
    component: lazy(() => import('../pages/IdHashPage.jsx')),
  },
  {
    id: 'password',
    path: '/gerador-senha',
    category: 'generators',
    icon: 'lock',
    keywords: 'senha password forte segura generator',
    component: lazy(() => import('../pages/PasswordPage.jsx')),
  },
  {
    id: 'qr',
    path: '/gerador-qr',
    category: 'generators',
    icon: 'qr',
    keywords: 'qr code qrcode png svg wifi link',
    component: lazy(() => import('../pages/QrCodePage.jsx')),
  },
  {
    id: 'units',
    path: '/conversor-unidades',
    category: 'converters',
    icon: 'ruler',
    keywords: 'unidades medidas comprimento peso temperatura bytes',
    component: lazy(() => import('../pages/UnitConverterPage.jsx')),
  },
  {
    id: 'currency',
    path: '/conversor-moedas',
    category: 'converters',
    icon: 'coins',
    remote: true,
    keywords: 'moedas câmbio cambio dólar dolar euro real cotação',
    component: lazy(() => import('../pages/CurrencyPage.jsx')),
  },
  {
    id: 'calculator',
    path: '/calculadora',
    category: 'calculators',
    icon: 'calculator',
    keywords: 'calculadora calculator soma',
    component: lazy(() => import('../pages/CalculatorPage.jsx')),
  },
  {
    id: 'percentage',
    path: '/calculadora-porcentagem',
    category: 'calculators',
    icon: 'percent',
    keywords: 'porcentagem percentual desconto aumento percent',
    component: lazy(() => import('../pages/PercentagePage.jsx')),
  },
  {
    id: 'interest',
    path: '/juros-compostos',
    category: 'calculators',
    icon: 'chart',
    keywords: 'juros compostos investimento aporte rendimento',
    component: lazy(() => import('../pages/CompoundInterestPage.jsx')),
  },
  {
    id: 'bmi',
    path: '/calculadora-imc',
    category: 'calculators',
    icon: 'scale',
    keywords: 'imc bmi peso altura índice massa corporal',
    component: lazy(() => import('../pages/BmiPage.jsx')),
  },
  {
    id: 'timer',
    path: '/timer-pomodoro',
    category: 'productivity',
    icon: 'timer',
    keywords: 'timer pomodoro foco temporizador cronômetro',
    component: lazy(() => import('../pages/TimerPage.jsx')),
  },
  {
    id: 'picker',
    path: '/roleta-sorteador',
    category: 'fun',
    icon: 'wheel',
    keywords: 'roleta sorteio sorteador aleatório random wheel',
    component: lazy(() => import('../pages/RandomPickerPage.jsx')),
  },
  {
    id: 'memory',
    path: '/jogo-memoria',
    category: 'fun',
    icon: 'grid',
    keywords: 'jogo memória memory game',
    component: lazy(() => import('../pages/MemoryGamePage.jsx')),
  },
];

export const TOOLS_BY_PATH = Object.fromEntries(TOOLS.map((tool) => [tool.path, tool]));

/** Normaliza texto para busca: minúsculas e sem acentos. */
export function normalizeSearch(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function searchTools(query, t) {
  const q = normalizeSearch(query.trim());
  if (!q) return TOOLS;
  const terms = q.split(/\s+/);
  return TOOLS.filter((tool) => {
    const haystack = normalizeSearch(
      `${t(`tools.${tool.id}.name`)} ${t(`tools.${tool.id}.desc`)} ${tool.keywords} ${tool.path}`
    );
    return terms.every((term) => haystack.includes(term));
  });
}
