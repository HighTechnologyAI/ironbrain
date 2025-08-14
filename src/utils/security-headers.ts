/**
 * Security utilities for content security policy and security headers
 */

// Content Security Policy configuration
export const CSP_CONFIG = {
  directives: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for Vite in development
      "'unsafe-eval'", // Required for Vite in development  
      "https://cdn.jsdelivr.net",
      "https://unpkg.com"
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled-components and Tailwind
      "https://fonts.googleapis.com"
    ],
    'font-src': [
      "'self'",
      "https://fonts.gstatic.com",
      "data:"
    ],
    'img-src': [
      "'self'",
      "data:",
      "blob:",
      "https:",
      "*.supabase.co"
    ],
    'connect-src': [
      "'self'",
      "wss:",
      "ws:",
      "*.supabase.co",
      "https://api.openai.com",
      "https://api.anthropic.com",
      "https://api.perplexity.ai"
    ],
    'media-src': ["'self'", "data:", "blob:"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': []
  }
};

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

/**
 * Generate CSP header string from configuration
 */
export const generateCSPHeader = (): string => {
  const directives = Object.entries(CSP_CONFIG.directives)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
  
  return directives;
};

/**
 * Security event logger
 */
export interface SecurityEvent {
  type: 'authentication_failure' | 'suspicious_request' | 'data_access' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: string;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000;

  log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    this.events.push(securityEvent);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Security Event]', securityEvent);
    }

    // Send to monitoring service in production
    this.sendToMonitoring(securityEvent);
  }

  private async sendToMonitoring(event: SecurityEvent): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      try {
        // Send to your monitoring service (e.g., Sentry, LogRocket, etc.)
        await fetch('/api/security-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
      } catch (error) {
        console.error('Failed to send security event:', error);
      }
    }
  }

  getEvents(filter?: Partial<Pick<SecurityEvent, 'type' | 'severity'>>): SecurityEvent[] {
    if (!filter) return [...this.events];
    
    return this.events.filter(event => {
      if (filter.type && event.type !== filter.type) return false;
      if (filter.severity && event.severity !== filter.severity) return false;
      return true;
    });
  }

  clearEvents(): void {
    this.events = [];
  }
}

export const securityLogger = new SecurityLogger();

/**
 * Rate limiting store for client-side protection
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class ClientRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private defaultLimit = 10;
  private defaultWindow = 60000; // 1 minute

  isAllowed(key: string, limit = this.defaultLimit, windowMs = this.defaultWindow): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (entry.count >= limit) {
      securityLogger.log({
        type: 'suspicious_request',
        severity: 'medium',
        details: { 
          rateLimitExceeded: true, 
          key, 
          count: entry.count, 
          limit 
        }
      });
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingTime(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return 0;
    return Math.max(0, entry.resetTime - Date.now());
  }

  clear(key?: string): void {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }
}

export const clientRateLimiter = new ClientRateLimiter();

/**
 * Secure session management
 */
export interface SecureSession {
  sessionId: string;
  userId: string;
  createdAt: string;
  lastActivity: string;
  ip?: string;
  userAgent?: string;
}

class SessionManager {
  private sessions = new Map<string, SecureSession>();
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private readonly ACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

  createSession(userId: string, ip?: string, userAgent?: string): string {
    const sessionId = this.generateSecureId();
    const now = new Date().toISOString();
    
    const session: SecureSession = {
      sessionId,
      userId,
      createdAt: now,
      lastActivity: now,
      ip,
      userAgent
    };

    this.sessions.set(sessionId, session);
    this.cleanup();

    securityLogger.log({
      type: 'authentication_failure',
      severity: 'low',
      userId,
      ip,
      userAgent,
      details: { action: 'session_created', sessionId }
    });

    return sessionId;
  }

  validateSession(sessionId: string): SecureSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const now = Date.now();
    const created = new Date(session.createdAt).getTime();
    const lastActivity = new Date(session.lastActivity).getTime();

    // Check absolute timeout
    if (now - created > this.SESSION_TIMEOUT) {
      this.destroySession(sessionId);
      return null;
    }

    // Check activity timeout
    if (now - lastActivity > this.ACTIVITY_TIMEOUT) {
      this.destroySession(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = new Date().toISOString();
    return session;
  }

  destroySession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      securityLogger.log({
        type: 'authentication_failure',
        severity: 'low',
        userId: session.userId,
        details: { action: 'session_destroyed', sessionId }
      });
    }
    return this.sessions.delete(sessionId);
  }

  private generateSecureId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      const created = new Date(session.createdAt).getTime();
      if (now - created > this.SESSION_TIMEOUT) {
        this.sessions.delete(sessionId);
      }
    }
  }

  getSessions(userId?: string): SecureSession[] {
    const sessions = Array.from(this.sessions.values());
    return userId ? sessions.filter(s => s.userId === userId) : sessions;
  }
}

export const sessionManager = new SessionManager();
