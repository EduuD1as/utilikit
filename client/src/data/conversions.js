// Named export of unit conversion metadata used by UnitConverterPage
export const CONVERSIONS = {
  length: {
    name: 'categoryLength',
    units: {
      m: { name: 'unitMeter', toBase: 1 },
      km: { name: 'unitKilometer', toBase: 1000 },
      cm: { name: 'unitCentimeter', toBase: 0.01 },
    },
  },

  weight: {
    name: 'categoryWeight',
    units: {
      g: { name: 'unitGram', toBase: 1 },
      kg: { name: 'unitKilogram', toBase: 1000 },
      lb: { name: 'unitPound', toBase: 453.59237 },
    },
  },

  temperature: {
    name: 'categoryTemperature',
    units: {
      c: { name: 'unitCelsius' },
      f: { name: 'unitFahrenheit' },
      k: { name: 'unitKelvin' },
    },
  },

  volume: {
    name: 'categoryVolume',
    units: {
      l: { name: 'unitLiter', toBase: 1 },
      ml: { name: 'unitMilliliter', toBase: 0.001 },
      m3: { name: 'unitCubicMeter', toBase: 1000 },
    },
  },

  speed: {
    name: 'categorySpeed',
    units: {
      ms: { name: 'unitMeterPerSecond', toBase: 1 },
      kmh: { name: 'unitKilometerPerHour', toBase: 0.27777777777778 },
    },
  },

  area: {
    name: 'categoryArea',
    units: {
      m2: { name: 'unitSquareMeter', toBase: 1 },
      km2: { name: 'unitSquareKilometer', toBase: 1_000_000 },
      ha: { name: 'unitHectare', toBase: 10000 },
    },
  },

  time: {
    name: 'categoryTime',
    units: {
      s: { name: 'unitSecond', toBase: 1 },
      min: { name: 'unitMinute', toBase: 60 },
      h: { name: 'unitHour', toBase: 3600 },
    },
  },

  digital: {
    name: 'categoryDigital',
    units: {
      byte: { name: 'unitByte', toBase: 1 },
      kb: { name: 'unitKilobyte', toBase: 1024 },
      mb: { name: 'unitMegabyte', toBase: 1024 * 1024 },
    },
  },

  energy: {
    name: 'categoryEnergy',
    units: {
      j: { name: 'unitJoule', toBase: 1 },
      kj: { name: 'unitKilojoule', toBase: 1000 },
      cal: { name: 'unitCalorie', toBase: 4.184 },
    },
  },

  pressure: {
    name: 'categoryPressure',
    units: {
      pa: { name: 'unitPascal', toBase: 1 },
      bar: { name: 'unitBar', toBase: 100000 },
      atm: { name: 'unitAtm', toBase: 101325 },
    },
  },

  frequency: {
    name: 'categoryFrequency',
    units: {
      hz: { name: 'unitHertz', toBase: 1 },
      khz: { name: 'unitKilohertz', toBase: 1000 },
    },
  },

  angle: {
    name: 'categoryAngle',
    units: {
      deg: { name: 'unitDegree', toBase: 1 },
      rad: { name: 'unitRadian', toBase: 57.29577951308232 },
    },
  },

  fuel: {
    name: 'categoryFuel',
    // Fuel handled specially in code (inverse conversions), toBase not required
    units: {
      l100km: { name: 'unitLPer100km' },
      kml: { name: 'unitKmPerL' },
      mpg: { name: 'unitMPG' },
      mpgus: { name: 'unitMPGUS' },
    },
  },
};
