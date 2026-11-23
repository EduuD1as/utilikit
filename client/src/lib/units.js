/**
 * Fatores para a unidade base de cada categoria. `f` multiplica para chegar
 * à base; categorias não lineares (temperatura, consumo) usam toBase/fromBase.
 */
const u = (id, pt, en, f) => ({ id, pt, en, f });

export const UNIT_CATEGORIES = [
  {
    id: 'length',
    pt: 'Comprimento',
    en: 'Length',
    units: [
      u('mm', 'Milímetro', 'Millimeter', 0.001),
      u('cm', 'Centímetro', 'Centimeter', 0.01),
      u('m', 'Metro', 'Meter', 1),
      u('km', 'Quilômetro', 'Kilometer', 1000),
      u('in', 'Polegada', 'Inch', 0.0254),
      u('ft', 'Pé', 'Foot', 0.3048),
      u('yd', 'Jarda', 'Yard', 0.9144),
      u('mi', 'Milha', 'Mile', 1609.344),
      u('nmi', 'Milha náutica', 'Nautical mile', 1852),
    ],
  },
  {
    id: 'mass',
    pt: 'Massa',
    en: 'Mass',
    units: [
      u('mg', 'Miligrama', 'Milligram', 0.001),
      u('g', 'Grama', 'Gram', 1),
      u('kg', 'Quilograma', 'Kilogram', 1000),
      u('t', 'Tonelada', 'Tonne', 1e6),
      u('oz', 'Onça', 'Ounce', 28.349523125),
      u('lb', 'Libra', 'Pound', 453.59237),
      u('st', 'Stone', 'Stone', 6350.29318),
    ],
  },
  {
    id: 'temperature',
    pt: 'Temperatura',
    en: 'Temperature',
    units: [
      { id: 'c', pt: 'Celsius (°C)', en: 'Celsius (°C)', toBase: (v) => v, fromBase: (v) => v },
      { id: 'f', pt: 'Fahrenheit (°F)', en: 'Fahrenheit (°F)', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      { id: 'k', pt: 'Kelvin (K)', en: 'Kelvin (K)', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  {
    id: 'volume',
    pt: 'Volume',
    en: 'Volume',
    units: [
      u('ml', 'Mililitro', 'Milliliter', 0.001),
      u('l', 'Litro', 'Liter', 1),
      u('m3', 'Metro cúbico', 'Cubic meter', 1000),
      u('tsp', 'Colher de chá (5 ml)', 'Teaspoon (5 ml)', 0.005),
      u('tbsp', 'Colher de sopa (15 ml)', 'Tablespoon (15 ml)', 0.015),
      u('cup', 'Xícara (240 ml)', 'Cup (240 ml)', 0.24),
      u('floz', 'Onça fluida (EUA)', 'Fluid ounce (US)', 0.0295735295625),
      u('gal', 'Galão (EUA)', 'Gallon (US)', 3.785411784),
    ],
  },
  {
    id: 'area',
    pt: 'Área',
    en: 'Area',
    units: [
      u('cm2', 'Centímetro quadrado', 'Square centimeter', 1e-4),
      u('m2', 'Metro quadrado', 'Square meter', 1),
      u('ha', 'Hectare', 'Hectare', 1e4),
      u('km2', 'Quilômetro quadrado', 'Square kilometer', 1e6),
      u('ft2', 'Pé quadrado', 'Square foot', 0.09290304),
      u('ac', 'Acre', 'Acre', 4046.8564224),
      u('alq', 'Alqueire paulista', 'Alqueire (São Paulo)', 24200),
    ],
  },
  {
    id: 'speed',
    pt: 'Velocidade',
    en: 'Speed',
    units: [
      u('ms', 'Metro por segundo', 'Meter per second', 1),
      u('kmh', 'Quilômetro por hora', 'Kilometer per hour', 1 / 3.6),
      u('mph', 'Milha por hora', 'Mile per hour', 0.44704),
      u('kn', 'Nó', 'Knot', 1852 / 3600),
    ],
  },
  {
    id: 'time',
    pt: 'Tempo',
    en: 'Time',
    units: [
      u('ms', 'Milissegundo', 'Millisecond', 0.001),
      u('s', 'Segundo', 'Second', 1),
      u('min', 'Minuto', 'Minute', 60),
      u('h', 'Hora', 'Hour', 3600),
      u('d', 'Dia', 'Day', 86400),
      u('wk', 'Semana', 'Week', 604800),
      u('yr', 'Ano (365 dias)', 'Year (365 days)', 31536000),
    ],
  },
  {
    id: 'data',
    pt: 'Dados',
    en: 'Data',
    units: [
      u('bit', 'Bit', 'Bit', 0.125),
      u('B', 'Byte', 'Byte', 1),
      u('KB', 'Kilobyte (1000)', 'Kilobyte (1000)', 1e3),
      u('KiB', 'Kibibyte (1024)', 'Kibibyte (1024)', 1024),
      u('MB', 'Megabyte (1000²)', 'Megabyte (1000²)', 1e6),
      u('MiB', 'Mebibyte (1024²)', 'Mebibyte (1024²)', 1024 ** 2),
      u('GB', 'Gigabyte (1000³)', 'Gigabyte (1000³)', 1e9),
      u('GiB', 'Gibibyte (1024³)', 'Gibibyte (1024³)', 1024 ** 3),
      u('TB', 'Terabyte (1000⁴)', 'Terabyte (1000⁴)', 1e12),
      u('TiB', 'Tebibyte (1024⁴)', 'Tebibyte (1024⁴)', 1024 ** 4),
    ],
  },
  {
    id: 'pressure',
    pt: 'Pressão',
    en: 'Pressure',
    units: [
      u('pa', 'Pascal', 'Pascal', 1),
      u('kpa', 'Quilopascal', 'Kilopascal', 1000),
      u('bar', 'Bar', 'Bar', 1e5),
      u('atm', 'Atmosfera', 'Atmosphere', 101325),
      u('psi', 'PSI', 'PSI', 6894.757293168),
      u('mmhg', 'Milímetro de mercúrio', 'Millimeter of mercury', 133.322387415),
    ],
  },
  {
    id: 'energy',
    pt: 'Energia',
    en: 'Energy',
    units: [
      u('j', 'Joule', 'Joule', 1),
      u('kj', 'Quilojoule', 'Kilojoule', 1000),
      u('cal', 'Caloria', 'Calorie', 4.184),
      u('kcal', 'Quilocaloria', 'Kilocalorie', 4184),
      u('wh', 'Watt-hora', 'Watt-hour', 3600),
      u('kwh', 'Quilowatt-hora', 'Kilowatt-hour', 3.6e6),
    ],
  },
  {
    id: 'angle',
    pt: 'Ângulo',
    en: 'Angle',
    units: [
      u('deg', 'Grau', 'Degree', 1),
      u('rad', 'Radiano', 'Radian', 180 / Math.PI),
      u('grad', 'Grado', 'Gradian', 0.9),
      u('turn', 'Volta', 'Turn', 360),
    ],
  },
  {
    id: 'fuel',
    pt: 'Consumo',
    en: 'Fuel economy',
    // Base: km/l. As unidades "por distância" são inversas.
    units: [
      { id: 'kml', pt: 'km/l', en: 'km/L', toBase: (v) => v, fromBase: (v) => v },
      { id: 'l100', pt: 'l/100 km', en: 'L/100 km', toBase: (v) => 100 / v, fromBase: (v) => 100 / v },
      { id: 'mpg', pt: 'mpg (EUA)', en: 'mpg (US)', toBase: (v) => v * 0.425143707, fromBase: (v) => v / 0.425143707 },
      { id: 'mpguk', pt: 'mpg (Reino Unido)', en: 'mpg (UK)', toBase: (v) => v * 0.354006189, fromBase: (v) => v / 0.354006189 },
    ],
  },
];

export function convertUnit(value, from, to) {
  const base = from.toBase ? from.toBase(value) : value * from.f;
  return to.fromBase ? to.fromBase(base) : base / to.f;
}

export function formatNumber(value, locale) {
  if (!Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-6)) return value.toExponential(6).replace(/\.?0+e/, 'e');
  return new Intl.NumberFormat(locale, { maximumSignificantDigits: 12 }).format(value);
}
