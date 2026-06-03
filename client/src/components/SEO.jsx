import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const SEO_DATA = {
  '/': {
    pt: {
      title: 'UtiliKit — Ferramentas online gratuitas',
      description: 'Calculadoras, conversores, geradores e contadores online gratuitos. Ferramentas úteis para o dia a dia, rápidas, modernas e funcionam no navegador sem cadastro.',
      keywords: 'calculadora, conversor, gerador, contador, ferramentas online, utilitários, ferramentas gratuitas, calculadora online, conversor de moedas, gerador de QR code, contador de caracteres, timer pomodoro',
    },
    en: {
      title: 'UtiliKit — Free online tools',
      description: 'Free online calculators, converters, generators and counters. Useful tools for daily life, fast, modern and work in the browser without registration.',
      keywords: 'calculator, converter, generator, counter, online tools, utilities, free tools, online calculator, currency converter, QR code generator, character counter, pomodoro timer',
    },
  },
  '/formatador-sql': {
    pt: {
      title: 'Formatador SQL — UtiliKit',
      description: 'Formate e organize código SQL automaticamente. Melhore a legibilidade e manutenção das suas queries.',
      keywords: 'formatador sql, sql formatter, organizar sql, indentar sql, sql beautifier',
    },
    en: {
      title: 'SQL Formatter — UtiliKit',
      description: 'Automatically format and organize SQL code. Improve readability and maintenance of your queries.',
      keywords: 'sql formatter, format sql, organize sql, indent sql, sql beautifier',
    },
  },
  '/formatador-json': {
    pt: {
      title: 'Formatador JSON — UtiliKit',
      description: 'Formate, valide e minifique código JSON. Ferramenta essencial para desenvolvedores.',
      keywords: 'formatador json, json formatter, validar json, minificar json, json beautifier',
    },
    en: {
      title: 'JSON Formatter — UtiliKit',
      description: 'Format, validate and minify JSON code. Essential tool for developers.',
      keywords: 'json formatter, format json, validate json, minify json, json beautifier',
    },
  },
  '/conversor-moedas': {
    pt: {
      title: 'Conversor de Moedas — UtiliKit',
      description: 'Converta moedas em tempo real com taxas atualizadas. Dólar, Euro, Real e mais.',
      keywords: 'conversor moedas, câmbio, converter dólar, converter euro, taxa de câmbio',
    },
    en: {
      title: 'Currency Converter — UtiliKit',
      description: 'Convert currencies in real-time with updated rates. Dollar, Euro, Real and more.',
      keywords: 'currency converter, exchange rate, convert dollar, convert euro, exchange rate',
    },
  },
  '/contador-caracteres': {
    pt: {
      title: 'Contador de Caracteres — UtiliKit',
      description: 'Conte caracteres, palavras, linhas e parágrafos em tempo real. Ferramenta essencial para escritores e desenvolvedores.',
      keywords: 'contador caracteres, contador palavras, contar texto, contador online, word counter',
    },
    en: {
      title: 'Character Counter — UtiliKit',
      description: 'Count characters, words, lines and paragraphs in real-time. Essential tool for writers and developers.',
      keywords: 'character counter, word counter, count text, online counter, word counter',
    },
  },
  '/calculadora': {
    pt: {
      title: 'Calculadora Online — UtiliKit',
      description: 'Calculadora simples e funcional para operações básicas. Rápida e fácil de usar.',
      keywords: 'calculadora online, calculadora simples, calculadora grátis, calculadora básica',
    },
    en: {
      title: 'Online Calculator — UtiliKit',
      description: 'Simple and functional calculator for basic operations. Fast and easy to use.',
      keywords: 'online calculator, simple calculator, free calculator, basic calculator',
    },
  },
  '/conversor-unidades': {
    pt: {
      title: 'Conversor de Unidades Completo — UtiliKit',
      description: 'Conversor de unidades online gratuito e instantâneo. Converta comprimento, peso, temperatura, volume, velocidade, área, tempo, armazenamento digital, energia, pressão, frequência, ângulo e consumo de combustível. Preciso e fácil de usar.',
      keywords: 'conversor unidades, converter medidas, conversor comprimento, conversor peso, conversor temperatura, conversor volume, conversor velocidade, conversor área, conversor tempo, conversor armazenamento, conversor energia, conversor pressão, conversor frequência, conversor ângulo, conversor combustível',
    },
    en: {
      title: 'Complete Unit Converter — UtiliKit',
      description: 'Free online instant unit converter. Convert length, weight, temperature, volume, speed, area, time, digital storage, energy, pressure, frequency, angle, and fuel economy. Accurate and easy to use.',
      keywords: 'unit converter, convert measurements, length converter, weight converter, temperature converter, volume converter, speed converter, area converter, time converter, digital storage converter, energy converter, pressure converter, frequency converter, angle converter, fuel economy converter',
    },
  },
  '/gerador-qr': {
    pt: {
      title: 'Gerador de QR Code — UtiliKit',
      description: 'Gere códigos QR gratuitos para URLs, texto e mais. Personalize cores e tamanhos.',
      keywords: 'gerador qr code, qr code generator, criar qr code, qr code grátis',
    },
    en: {
      title: 'QR Code Generator — UtiliKit',
      description: 'Generate free QR codes for URLs, text and more. Customize colors and sizes.',
      keywords: 'qr code generator, create qr code, qr code free, make qr code',
    },
  },
  '/gerador-id-hash': {
    pt: {
      title: 'Gerador de UUID e Hash — UtiliKit',
      description: 'Gere UUIDs v4, strings aleatórias e hashes criptográficos (SHA-1, SHA-256, SHA-512, MD5) 100% local no navegador. Ferramenta premium para desenvolvedores com Web Crypto API.',
      keywords: 'gerador uuid, gerador hash, uuid v4, sha256 generator, sha512 generator, sha1 generator, md5 generator, random string generator, gerador senha, web crypto api, ferramenta desenvolvedor',
    },
    en: {
      title: 'UUID and Hash Generator — UtiliKit',
      description: 'Generate UUID v4, random strings and cryptographic hashes (SHA-1, SHA-256, SHA-512, MD5) 100% locally in browser. Premium tool for developers with Web Crypto API.',
      keywords: 'uuid generator, hash generator, uuid v4, sha256 generator, sha512 generator, sha1 generator, md5 generator, random string generator, password generator, web crypto api, developer tool',
    },
  },
  '/timer-pomodoro': {
    pt: {
      title: 'Timer e Pomodoro — UtiliKit',
      description: 'Timer e técnica Pomodoro para aumentar produtividade. Gerencie seu tempo eficientemente.',
      keywords: 'timer pomodoro, técnica pomodoro, timer online, cronômetro, produtividade',
    },
    en: {
      title: 'Timer and Pomodoro — UtiliKit',
      description: 'Timer and Pomodoro technique to increase productivity. Manage your time efficiently.',
      keywords: 'pomodoro timer, pomodoro technique, online timer, stopwatch, productivity',
    },
  },
  '/jogo-memoria': {
    pt: {
      title: 'Jogo da Memória — UtiliKit',
      description: 'Jogo da memória para treinar o cérebro. Divirta-se enquanto exercita a mente.',
      keywords: 'jogo memória, memory game, jogo online, treinar cérebro, jogo grátis',
    },
    en: {
      title: 'Memory Game — UtiliKit',
      description: 'Memory game to train your brain. Have fun while exercising your mind.',
      keywords: 'memory game, brain training, online game, train brain, free game',
    },
  },
  '/roleta-sorteador': {
    pt: {
      title: 'Sorteador de Roleta — UtiliKit',
      description: 'Sorteador de roleta aleatória. Adicione opções e deixe a roleta escolher por você.',
      keywords: 'sorteador roleta, roleta aleatória, wheel spinner, sorteador online, escolher aleatório',
    },
    en: {
      title: 'Random Wheel Picker — UtiliKit',
      description: 'Random wheel picker. Add options and let the wheel choose for you.',
      keywords: 'wheel picker, random wheel, spinner, online picker, random choice',
    },
  },
  '/calculadora-imc': {
    pt: {
      title: 'Calculadora de IMC — UtiliKit',
      description: 'Calcule seu Índice de Massa Corporal (IMC) facilmente. Verifique sua categoria de peso.',
      keywords: 'calculadora imc, índice massa corporal, bmi calculator, calcular peso, saúde',
    },
    en: {
      title: 'BMI Calculator — UtiliKit',
      description: 'Calculate your Body Mass Index (BMI) easily. Check your weight category.',
      keywords: 'bmi calculator, body mass index, calculate weight, health',
    },
  },
  '/privacidade': {
    pt: {
      title: 'Política de Privacidade — UtiliKit',
      description: 'Política de privacidade do UtiliKit. Saiba como protegemos seus dados.',
      keywords: 'política privacidade, privacidade, proteção dados, lgpd',
    },
    en: {
      title: 'Privacy Policy — UtiliKit',
      description: 'UtiliKit privacy policy. Learn how we protect your data.',
      keywords: 'privacy policy, privacy, data protection, gdpr',
    },
  },
  '/termos': {
    pt: {
      title: 'Termos de Uso — UtiliKit',
      description: 'Termos de uso do UtiliKit. Conheça as regras de uso da plataforma.',
      keywords: 'termos uso, termos de serviço, regras, legal',
    },
    en: {
      title: 'Terms of Use — UtiliKit',
      description: 'UtiliKit terms of use. Know the platform usage rules.',
      keywords: 'terms of use, terms of service, rules, legal',
    },
  },
};

export function SEO({ path }) {
  const { language } = useLanguage();
  const seoData = SEO_DATA[path] || SEO_DATA['/'];
  const data = seoData[language] || seoData['pt'];

  useEffect(() => {
    // Update document title
    document.title = data.title;

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', data.description);

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', data.keywords);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://utilikit.com.br${path}`);

    // Update Open Graph
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.property = 'og:title';
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', data.title);

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.property = 'og:description';
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', data.description);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.property = 'og:url';
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('href', `https://utilikit.com.br${path}`);

    // Update Twitter
    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (!twitterTitle) {
      twitterTitle = document.createElement('meta');
      twitterTitle.name = 'twitter:title';
      document.head.appendChild(twitterTitle);
    }
    twitterTitle.setAttribute('content', data.title);

    let twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (!twitterDescription) {
      twitterDescription = document.createElement('meta');
      twitterDescription.name = 'twitter:description';
      document.head.appendChild(twitterDescription);
    }
    twitterDescription.setAttribute('content', data.description);

    let twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (!twitterUrl) {
      twitterUrl = document.createElement('meta');
      twitterUrl.name = 'twitter:url';
      document.head.appendChild(twitterUrl);
    }
    twitterUrl.setAttribute('href', `https://utilikit.com.br${path}`);
  }, [path, language, data]);

  return null;
}
