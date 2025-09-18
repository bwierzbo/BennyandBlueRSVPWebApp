/**
 * Performance monitoring and measurement utilities
 * Provides benchmarking and optimization tracking for RSVP form operations
 */

export interface PerformanceMetrics {
  timestamp: number;
  operation: string;
  duration: number;
  details?: Record<string, any>;
}

export interface FormPerformanceMetrics {
  dynamicFieldRendering: number;
  formSubmission: number;
  databaseOperation: number;
  guestFieldUpdate: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private startTimes: Map<string, number> = new Map();

  // Start timing an operation
  startTiming(operation: string): void {
    this.startTimes.set(operation, performance.now());
  }

  // End timing and record metrics
  endTiming(operation: string, details?: Record<string, any>): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) {
      console.warn(`No start time found for operation: ${operation}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.push({
      timestamp: Date.now(),
      operation,
      duration,
      details
    });

    this.startTimes.delete(operation);
    return duration;
  }

  // Get metrics for a specific operation
  getMetrics(operation?: string): PerformanceMetrics[] {
    if (operation) {
      return this.metrics.filter(m => m.operation === operation);
    }
    return [...this.metrics];
  }

  // Get average duration for an operation
  getAverageDuration(operation: string): number {
    const operationMetrics = this.getMetrics(operation);
    if (operationMetrics.length === 0) return 0;

    const totalDuration = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalDuration / operationMetrics.length;
  }

  // Clear metrics (useful for testing)
  clearMetrics(): void {
    this.metrics = [];
    this.startTimes.clear();
  }

  // Add a metric directly (for specific use cases)
  addMetric(operation: string, duration: number, details?: Record<string, any>): void {
    this.metrics.push({
      timestamp: Date.now(),
      operation,
      duration,
      details
    });
  }

  // Get performance summary
  getSummary(): Record<string, { count: number; averageDuration: number; maxDuration: number }> {
    const summary: Record<string, { count: number; averageDuration: number; maxDuration: number }> = {};

    this.metrics.forEach(metric => {
      if (!summary[metric.operation]) {
        summary[metric.operation] = {
          count: 0,
          averageDuration: 0,
          maxDuration: 0
        };
      }

      const stats = summary[metric.operation];
      stats.count += 1;
      stats.maxDuration = Math.max(stats.maxDuration, metric.duration);
    });

    // Calculate averages
    Object.keys(summary).forEach(operation => {
      const operationMetrics = this.getMetrics(operation);
      const totalDuration = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
      summary[operation].averageDuration = totalDuration / operationMetrics.length;
    });

    return summary;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Performance benchmark targets
export const PERFORMANCE_TARGETS = {
  DYNAMIC_FIELD_RENDERING: 100, // <100ms target
  FORM_SUBMISSION: 2000, // <2 seconds target
  DATABASE_OPERATION: 500, // <500ms target for guest operations
  GUEST_FIELD_UPDATE: 50, // <50ms for individual guest field updates
} as const;

// High-level performance decorator for functions
export function measurePerformance<T extends (...args: any[]) => any>(
  operation: string,
  fn: T
): T {
  return ((...args: any[]) => {
    performanceMonitor.startTiming(operation);

    try {
      const result = fn(...args);

      // Handle both sync and async functions
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          performanceMonitor.endTiming(operation);
        });
      } else {
        performanceMonitor.endTiming(operation);
        return result;
      }
    } catch (error) {
      performanceMonitor.endTiming(operation);
      throw error;
    }
  }) as T;
}

// React hook for measuring component render performance
export function usePerformanceMonitor(componentName: string) {
  const renderStart = performance.now();

  React.useEffect(() => {
    const renderDuration = performance.now() - renderStart;
    // Record the render duration directly
    performanceMonitor.addMetric(`${componentName}_render`, renderDuration);
  });

  return {
    startTiming: (operation: string) => performanceMonitor.startTiming(`${componentName}_${operation}`),
    endTiming: (operation: string, details?: Record<string, any>) =>
      performanceMonitor.endTiming(`${componentName}_${operation}`, details)
  };
}

// Bundle size analysis utilities
export const bundleAnalysis = {
  // Estimate component bundle impact
  estimateComponentSize: (componentName: string): number => {
    // Simplified estimation - in real implementation, this would analyze actual bundle
    const sizeMap: Record<string, number> = {
      'RSVPForm': 15000, // ~15KB estimated
      'VenueDisclaimer': 2000, // ~2KB estimated
      'UI Components': 5000, // ~5KB for UI components
    };

    return sizeMap[componentName] || 1000;
  },

  // Get total estimated bundle size
  getTotalBundleSize: (): number => {
    return 25000; // ~25KB estimated total for RSVP functionality
  }
};

// Memory usage monitoring
export const memoryMonitor = {
  // Get current memory usage (if available)
  getCurrentMemoryUsage: (): number | null => {
    if ('memory' in performance) {
      // @ts-ignore - performance.memory is not in all TypeScript definitions
      return performance.memory?.usedJSHeapSize || null;
    }
    return null;
  },

  // Monitor memory usage during operation
  monitorMemoryDuringOperation: <T>(operation: string, fn: () => T): T => {
    const startMemory = memoryMonitor.getCurrentMemoryUsage();
    performanceMonitor.startTiming(`${operation}_memory`);

    const result = fn();

    const endMemory = memoryMonitor.getCurrentMemoryUsage();
    const memoryDelta = startMemory && endMemory ? endMemory - startMemory : 0;

    performanceMonitor.endTiming(`${operation}_memory`, {
      startMemory,
      endMemory,
      memoryDelta
    });

    return result;
  }
};

// Export React import for usePerformanceMonitor
import React from 'react';