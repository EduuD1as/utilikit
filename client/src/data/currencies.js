/** Moedas mais usadas no Brasil — aparecem primeiro no seletor. */
export const POPULAR_CURRENCY_CODES = [
  'BRL',
  'USD',
  'EUR',
  'GBP',
  'ARS',
  'CLP',
  'CAD',
  'AUD',
  'JPY',
  'CHF',
  'MXN',
  'CNY',
];

export const CURRENCY_NAMES = {
  BRL: 'Real brasileiro',
  USD: 'Dólar americano',
  EUR: 'Euro',
  GBP: 'Libra esterlina',
  ARS: 'Peso argentino',
  CLP: 'Peso chileno',
  CAD: 'Dólar canadense',
  AUD: 'Dólar australiano',
  JPY: 'Iene japonês',
  CHF: 'Franco suíço',
  MXN: 'Peso mexicano',
  CNY: 'Yuan chinês',
  HKD: 'Dólar de Hong Kong',
  SGD: 'Dólar de Singapura',
  NZD: 'Dólar neozelandês',
  SEK: 'Coroa sueca',
  NOK: 'Coroa norueguesa',
  DKK: 'Coroa dinamarquesa',
  PLN: 'Zloty polonês',
  CZK: 'Coroa tcheca',
  HUF: 'Forint húngaro',
  RON: 'Leu romeno',
  BGN: 'Lev búlgaro',
  ISK: 'Coroa islandesa',
  KRW: 'Won sul-coreano',
  INR: 'Rupia indiana',
  IDR: 'Rupia indonésia',
  PHP: 'Peso filipino',
  THB: 'Baht tailandês',
  ZAR: 'Rand sul-africano',
  TRY: 'Lira turca',
  ILS: 'Novo shekel israelense',
};

export function getCurrencyLabel(code) {
  const name = CURRENCY_NAMES[code];
  return name ? `${code} — ${name}` : code;
}
