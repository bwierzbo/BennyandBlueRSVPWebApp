/**
 * Production analytics and performance monitoring
 * Lightweight performance tracking for production use
 */

interface AnalyticsEvent {
  event: string;
  duration?: number;
  metadata?: Record<string, any>;
  timestamp: number;
}

class ProductionAnalytics {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 100; // Keep only recent events in memory

  // Track performance events
  trackEvent(event: string, duration?: number, metadata?: Record<string, any>): void {
    // Only track in production or if explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.ANALYTICS_ENABLED) {
      return;
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      duration,
      metadata,
      timestamp: Date.now()
    };

    this.events.push(analyticsEvent);

    // Keep only recent events to prevent memory leaks
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Send to analytics service if available
    this.sendToAnalyticsService(analyticsEvent);
  }

  // Track page views
  trackPageView(page: string): void {
    this.trackEvent('page_view', undefined, { page });
  }

  // Track form submissions
  trackFormSubmission(form: string, success: boolean, duration?: number): void {
    this.trackEvent('form_submission', duration, {
      form,
      success,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    });
  }

  // Track performance metrics
  trackPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
    // Only track if duration exceeds thresholds
    const thresholds = {
      form_render: 100,
      database_operation: 500,
      guest_field_update: 50
    };

    const threshold = thresholds[operation as keyof typeof thresholds] || 1000;

    if (duration > threshold) {
      this.trackEvent('performance_issue', duration, {
        operation,
        threshold,
        ...metadata
      });
    }
  }

  // Track errors
  trackError(error: Error, context?: string): void {
    this.trackEvent('error', undefined, {
      message: error.message,
      stack: error.stack,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    });
  }

  // Send events to external analytics service
  private sendToAnalyticsService(event: AnalyticsEvent): void {
    // In a real application, this would send to services like:
    // - Google Analytics
    // - Mixpanel
    // - Custom analytics endpoint
    // - Error tracking services like Sentry

    // For now, just log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }

    // Example: Send to a custom endpoint
    if (process.env.ANALYTICS_ENDPOINT) {
      fetch(process.env.ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      }).catch(error => {
        console.warn('Failed to send analytics event:', error);
      });
    }
  }

  // Get performance summary
  getPerformanceSummary(): Record<string, { count: number; averageDuration: number }> {
    const summary: Record<string, { count: number; totalDuration: number; averageDuration: number }> = {};

    this.events
      .filter(event => event.duration !== undefined)
      .forEach(event => {
        if (!summary[event.event]) {
          summary[event.event] = { count: 0, totalDuration: 0, averageDuration: 0 };
        }

        summary[event.event].count += 1;
        summary[event.event].totalDuration += event.duration!;
      });

    // Calculate averages
    Object.keys(summary).forEach(event => {
      summary[event].averageDuration = summary[event].totalDuration / summary[event].count;
    });

    return summary;
  }

  // Clear events (useful for testing)
  clearEvents(): void {
    this.events = [];
  }
}

// Global analytics instance
export const analytics = new ProductionAnalytics();

// Helper hooks for React components
export function useAnalytics() {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackFormSubmission: analytics.trackFormSubmission.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackError: analytics.trackError.bind(analytics)
  };
}

// Performance timing decorator
export function withAnalytics<T extends (...args: any[]) => any>(
  operation: string,
  fn: T
): T {
  return ((...args: any[]) => {
    const startTime = performance.now();

    try {
      const result = fn(...args);

      // Handle both sync and async functions
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          const duration = performance.now() - startTime;
          analytics.trackPerformance(operation, duration);
        });
      } else {
        const duration = performance.now() - startTime;
        analytics.trackPerformance(operation, duration);
        return result;
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      analytics.trackError(error as Error, operation);
      analytics.trackPerformance(operation, duration, { error: true });
      throw error;
    }
  }) as T;
}

// Web Vitals tracking (if available)
export function trackWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Core Web Vitals
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      // Cast to any to handle different entry types
      const typedEntry = entry as any;
      if (typedEntry.value !== undefined) {
        analytics.trackEvent('web_vital', typedEntry.value, {
          name: entry.name,
          rating: typedEntry.value < 2500 ? 'good' : typedEntry.value < 4000 ? 'needs-improvement' : 'poor'
        });
      }
    });
  });

  try {
    observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
  } catch (error) {
    console.warn('Performance observer not supported:', error);
  }
}