/**
 * error-messages.js
 * Traduz erros técnicos em mensagens amigáveis para o usuário
 */

export const ERROR_TYPES = {
  SOCIALCOUNTS_UNAVAILABLE: 'SOCIALCOUNTS_UNAVAILABLE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  CHANNEL_NOT_FOUND: 'CHANNEL_NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Classifica o tipo de erro baseado na mensagem/status
 */
export function classifyError(err) {
  const message = err?.message || String(err);
  const status = err?.status;

  // SocialCounts fora do ar
  if (message.includes('SocialCounts') || message.includes('503')) {
    return ERROR_TYPES.SOCIALCOUNTS_UNAVAILABLE;
  }

  // Rate limit (429)
  if (message.includes('429') || message.includes('rate limit')) {
    return ERROR_TYPES.RATE_LIMITED;
  }

  // Canal não encontrado
  if (
    message.includes('não encontrado') ||
    message.includes('not found') ||
    message.includes('404')
  ) {
    return ERROR_TYPES.CHANNEL_NOT_FOUND;
  }

  // Timeout
  if (message.includes('timeout') || message.includes('AbortError')) {
    return ERROR_TYPES.TIMEOUT;
  }

  // Erro de rede
  if (message.includes('ECONNRESET') || message.includes('ETIMEDOUT')) {
    return ERROR_TYPES.NETWORK_ERROR;
  }

  return ERROR_TYPES.UNKNOWN;
}

/**
 * Gera mensagem amigável baseada no tipo de erro
 * Retorna: { title, message, suggestion, severity }
 */
export function getUserFriendlyMessage(errorType) {
  const messages = {
    [ERROR_TYPES.SOCIALCOUNTS_UNAVAILABLE]: {
      title: '⚠️ Serviço Temporariamente Indisponível',
      message:
        'O SocialCounts (que fornece os números em tempo real) está temporariamente fora do ar.',
      suggestion:
        'Tente novamente em alguns segundos. Se o problema persistir, verifique a página: https://socialcounts.org',
      severity: 'warning',
    },

    [ERROR_TYPES.RATE_LIMITED]: {
      title: '⏳ Muitas Requisições',
      message: 'Você fez muitas requisições muito rápido.',
      suggestion: 'Por favor, aguarde alguns segundos antes de tentar novamente.',
      severity: 'warning',
    },

    [ERROR_TYPES.CHANNEL_NOT_FOUND]: {
      title: '🔍 Canal Não Encontrado',
      message:
        'Não conseguimos encontrar um canal com esse nome, handle ou ID.',
      suggestion:
        'Verifique se o nome está correto ou tente usar a URL completa do YouTube (https://www.youtube.com/@nomedocanal).',
      severity: 'error',
    },

    [ERROR_TYPES.TIMEOUT]: {
      title: '⏱️ Requisição Demorou Muito',
      message: 'A requisição ao YouTube demorou mais do que o esperado.',
      suggestion:
        'Verifique sua conexão com a internet e tente novamente. Se o problema persistir, use o ID do canal (UC...).',
      severity: 'warning',
    },

    [ERROR_TYPES.NETWORK_ERROR]: {
      title: '🌐 Erro de Conexão',
      message: 'Houve um problema ao conectar com o servidor.',
      suggestion: 'Verifique sua conexão com a internet e tente novamente.',
      severity: 'error',
    },

    [ERROR_TYPES.UNKNOWN]: {
      title: '❌ Erro Desconhecido',
      message: 'Algo deu errado, mas não conseguimos identificar o problema.',
      suggestion:
        'Tente novamente. Se o erro persistir, verifique o console do navegador (F12) para detalhes.',
      severity: 'error',
    },
  };

  return messages[errorType] || messages[ERROR_TYPES.UNKNOWN];
}

/**
 * Formata erro completo para exibição ao usuário
 */
export function formatErrorForUser(err) {
  const errorType = classifyError(err);
  const friendlyMessage = getUserFriendlyMessage(errorType);

  return {
    type: errorType,
    ...friendlyMessage,
    original: err?.message,
  };
}

/**
 * Retorna apenas a mensagem formatada (string)
 * Útil para exibição simples
 */
export function getErrorMessageForUser(err) {
  const formatted = formatErrorForUser(err);
  return `${formatted.title}\n${formatted.message}\n\n${formatted.suggestion}`;
}
