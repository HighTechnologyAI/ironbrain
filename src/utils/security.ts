// Утилиты безопасности для защиты от XSS и injection атак

/**
 * Санитизация HTML для предотвращения XSS атак
 */
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Валидация SQL запросов - разрешает только SELECT
 */
export const validateSqlQuery = (query: string): { isValid: boolean; error?: string } => {
  if (!query) {
    return { isValid: false, error: 'Запрос не может быть пустым' };
  }

  const trimmedQuery = query.trim().toLowerCase();
  
  // Проверяем, что запрос начинается с SELECT
  if (!trimmedQuery.startsWith('select')) {
    return { isValid: false, error: 'Разрешены только SELECT запросы' };
  }

  // Запрещенные команды
  const forbiddenCommands = [
    'insert', 'update', 'delete', 'drop', 'create', 'alter', 
    'grant', 'revoke', 'execute', 'exec', 'xp_', 'sp_'
  ];

  for (const cmd of forbiddenCommands) {
    if (trimmedQuery.includes(cmd)) {
      return { isValid: false, error: `Команда ${cmd.toUpperCase()} запрещена` };
    }
  }

  // Проверяем на подозрительные символы
  const suspiciousPatterns = [
    /;.*?(?:insert|update|delete|drop|create|alter)/i,
    /union.*?select/i,
    /\/\*.*?\*\//,
    /--/,
    /xp_/i,
    /sp_/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(query)) {
      return { isValid: false, error: 'Запрос содержит подозрительные конструкции' };
    }
  }

  return { isValid: true };
};

/**
 * Валидация admin ключа
 */
export const validateAdminKey = (key: string): { isValid: boolean; error?: string } => {
  if (!key) {
    return { isValid: false, error: 'Admin ключ не может быть пустым' };
  }

  if (key.length < 8) {
    return { isValid: false, error: 'Admin ключ должен быть не менее 8 символов' };
  }

  // Проверяем на слабые пароли
  const weakPasswords = [
    'admin', 'password', '12345678', 'qwerty', 'test',
    'tiger-admin-2025', 'admin123', 'password123'
  ];

  if (weakPasswords.includes(key.toLowerCase())) {
    return { isValid: false, error: 'Использован слабый admin ключ' };
  }

  return { isValid: true };
};

/**
 * Валидация пользовательского ввода
 */
export const validateUserInput = (input: string, maxLength = 1000): { isValid: boolean; error?: string; sanitized: string } => {
  if (!input) {
    return { isValid: true, sanitized: '' };
  }

  if (input.length > maxLength) {
    return { 
      isValid: false, 
      error: `Превышена максимальная длина (${maxLength} символов)`,
      sanitized: input
    };
  }

  // Проверяем на подозрительные паттерны
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /expression\s*\(/i,
    /url\s*\(/i,
    /@import/i,
    /binding\s*:/i
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(input)) {
      return { 
        isValid: false, 
        error: 'Ввод содержит потенциально опасный код',
        sanitized: sanitizeHtml(input)
      };
    }
  }

  return { 
    isValid: true, 
    sanitized: sanitizeHtml(input)
  };
};

/**
 * Генерация безопасного токена
 */
export const generateSecureToken = (length = 32): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const crypto = window.crypto || (window as any).msCrypto;
  
  if (crypto && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }
  } else {
    // Fallback для старых браузеров
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
  }
  
  return result;
};

/**
 * Rate limiting для клиентской стороны
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 минут
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Удаляем старые попытки
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return true;
  }
  
  getRemainingTime(identifier: string): number {
    const attempts = this.attempts.get(identifier) || [];
    if (attempts.length < this.maxAttempts) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    return Math.max(0, (oldestAttempt + this.windowMs) - Date.now());
  }
}