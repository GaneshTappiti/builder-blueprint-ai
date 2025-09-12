// Production monitoring and analytics
interface MonitoringEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

class MonitoringService {
  private sessionId: string;
  private userId?: string;
  private eventQueue: MonitoringEvent[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupOnlineListener();
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private setupOnlineListener() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Track user events
  track(event: string, properties?: Record<string, any>) {
    const monitoringEvent: MonitoringEvent = {
      event,
      properties,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.eventQueue.push(monitoringEvent);
    
    if (this.isOnline) {
      this.flushEvents();
    }
  }

  // Track errors
  trackError(error: Error, context?: string, properties?: Record<string, any>) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
      ...properties
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, properties?: Record<string, any>) {
    this.track('performance', {
      metric,
      value,
      ...properties
    });
  }

  // Track chat-specific events
  trackChatEvent(event: 'message_sent' | 'message_received' | 'file_uploaded' | 'channel_joined' | 'channel_left', properties?: Record<string, any>) {
    this.track(`chat_${event}`, properties);
  }

  // Track user engagement
  trackEngagement(action: string, duration?: number, properties?: Record<string, any>) {
    this.track('engagement', {
      action,
      duration,
      ...properties
    });
  }

  private async flushEvents() {
    if (this.eventQueue.length === 0 || !this.isOnline) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // In production, send to your analytics service
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...events);
    }
  }

  // Track page views
  trackPageView(page: string, properties?: Record<string, any>) {
    this.track('page_view', {
      page,
      ...properties
    });
  }

  // Track user actions
  trackUserAction(action: string, properties?: Record<string, any>) {
    this.track('user_action', {
      action,
      ...properties
    });
  }
}

// Lazy-loaded monitoring service to avoid SSR issues
let monitoringInstance: MonitoringService | null = null;

export const monitoring = {
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    if (!monitoringInstance) {
      monitoringInstance = new MonitoringService();
    }
    monitoringInstance.track(event, properties);
  },
  trackError: (error: Error, context?: string, properties?: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    if (!monitoringInstance) {
      monitoringInstance = new MonitoringService();
    }
    monitoringInstance.trackError(error, context, properties);
  },
  trackPerformance: (metric: string, value: number, properties?: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    if (!monitoringInstance) {
      monitoringInstance = new MonitoringService();
    }
    monitoringInstance.trackPerformance(metric, value, properties);
  },
  trackPageView: (page: string, properties?: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    if (!monitoringInstance) {
      monitoringInstance = new MonitoringService();
    }
    monitoringInstance.trackPageView(page, properties);
  },
  flush: () => {
    if (typeof window === 'undefined') return;
    if (!monitoringInstance) {
      monitoringInstance = new MonitoringService();
    }
    monitoringInstance.flush();
  },
  trackChatEvent: (event: string, properties?: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    if (!monitoringInstance) {
      monitoringInstance = new MonitoringService();
    }
    monitoringInstance.track(`chat_${event}`, properties);
  }
};

// Performance monitoring utilities
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();
  
  return Promise.resolve(fn()).then(
    (result) => {
      const duration = performance.now() - start;
      monitoring.trackPerformance(name, duration);
      return result;
    },
    (error) => {
      const duration = performance.now() - start;
      monitoring.trackPerformance(`${name}_error`, duration);
      monitoring.trackError(error, name);
      throw error;
    }
  );
}

// Web Vitals monitoring
export function trackWebVitals() {
  if (typeof window === 'undefined') return;
  
  // Track Largest Contentful Paint (LCP)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    monitoring.trackPerformance('lcp', lastEntry.startTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Track First Input Delay (FID)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      monitoring.trackPerformance('fid', (entry as any).processingStart - entry.startTime);
    });
  }).observe({ entryTypes: ['first-input'] });

  // Track Cumulative Layout Shift (CLS)
  let clsValue = 0;
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    });
    monitoring.trackPerformance('cls', clsValue);
  }).observe({ entryTypes: ['layout-shift'] });
}

// Error boundary integration
export function reportError(error: Error, errorInfo: any) {
  if (typeof window === 'undefined') return;
  monitoring.trackError(error, 'react_error_boundary', {
    componentStack: errorInfo.componentStack,
    errorBoundary: errorInfo.errorBoundary
  });
}
