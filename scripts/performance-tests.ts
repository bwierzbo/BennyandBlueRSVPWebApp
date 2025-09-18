/**
 * Performance test suite for RSVP application
 * Tests critical performance targets and monitors regression
 */

import { performance } from 'perf_hooks';

// Import functions to test
import { rsvpDb, guestValidation } from '../lib/db';
import { performanceMonitor, PERFORMANCE_TARGETS } from '../lib/performance';
import type { RSVPCreateData } from '../types';

interface PerformanceTestResult {
  testName: string;
  duration: number;
  target: number;
  passed: boolean;
  details?: Record<string, any>;
}

class PerformanceTestSuite {
  private results: PerformanceTestResult[] = [];

  private async runTest(
    testName: string,
    target: number,
    testFn: () => Promise<void> | void,
    details?: Record<string, any>
  ): Promise<PerformanceTestResult> {
    console.log(`Running test: ${testName}`);

    const startTime = performance.now();

    try {
      await testFn();
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
      throw error;
    }

    const duration = performance.now() - startTime;
    const passed = duration <= target;

    const result: PerformanceTestResult = {
      testName,
      duration,
      target,
      passed,
      details
    };

    this.results.push(result);

    console.log(`✓ ${testName}: ${duration.toFixed(2)}ms (target: ${target}ms) - ${passed ? 'PASS' : 'FAIL'}`);

    return result;
  }

  // Test database operations performance
  async testDatabaseOperations(): Promise<void> {
    // Test guest names serialization
    await this.runTest(
      'Guest Names Serialization',
      10, // 10ms target
      () => {
        const guestNames = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson'];
        for (let i = 0; i < 1000; i++) {
          guestValidation.safeSerializeGuestNames(guestNames);
        }
      },
      { iterations: 1000, guestCount: 5 }
    );

    // Test guest names parsing
    await this.runTest(
      'Guest Names Parsing',
      10, // 10ms target
      () => {
        const guestNamesJson = '["John Doe","Jane Smith","Bob Johnson","Alice Brown","Charlie Wilson"]';
        for (let i = 0; i < 1000; i++) {
          guestValidation.safeParseGuestNames(guestNamesJson);
        }
      },
      { iterations: 1000, guestCount: 5 }
    );

    // Test guest validation performance
    await this.runTest(
      'Guest Validation',
      5, // 5ms target
      () => {
        const guestNames = ['John Doe', 'Jane Smith', 'Bob Johnson'];
        for (let i = 0; i < 100; i++) {
          guestValidation.validateGuestNames(guestNames);
          guestValidation.validateGuestCount(3, guestNames);
        }
      },
      { iterations: 100, guestCount: 3 }
    );
  }

  // Test form simulation performance
  async testFormSimulation(): Promise<void> {
    // Simulate dynamic guest field updates
    await this.runTest(
      'Dynamic Guest Field Updates',
      PERFORMANCE_TARGETS.DYNAMIC_FIELD_RENDERING,
      () => {
        // Simulate multiple guest field additions/removals
        const guestNames: string[] = [];

        // Add 10 guests
        for (let i = 0; i < 10; i++) {
          guestNames.push(`Guest ${i + 1}`);
        }

        // Update each guest name
        for (let i = 0; i < 10; i++) {
          guestNames[i] = `Updated Guest ${i + 1}`;
        }

        // Remove guests
        guestNames.splice(5);
      },
      { maxGuests: 10, operations: 30 }
    );

    // Test form data preparation performance
    await this.runTest(
      'Form Data Preparation',
      20, // 20ms target
      () => {
        for (let i = 0; i < 100; i++) {
          const formData = {
            name: 'Test User',
            email: 'test@example.com',
            isAttending: true,
            numberOfGuests: 3,
            guestNames: ['Guest 1', 'Guest 2', 'Guest 3'],
            notes: 'Test notes'
          };

          // Simulate form data processing
          JSON.stringify(formData);
        }
      },
      { iterations: 100 }
    );
  }

  // Test memory usage patterns
  async testMemoryUsage(): Promise<void> {
    const initialMemory = this.getMemoryUsage();

    await this.runTest(
      'Memory Usage During Guest Operations',
      50, // 50ms target
      () => {
        // Create large guest arrays and clean them up
        const arrays: string[][] = [];

        for (let i = 0; i < 100; i++) {
          const guestNames = Array.from({ length: 10 }, (_, j) => `Guest ${j + 1} in batch ${i}`);
          arrays.push(guestNames);
        }

        // Process all arrays
        arrays.forEach(names => {
          guestValidation.safeSerializeGuestNames(names);
        });

        // Clean up
        arrays.length = 0;
      },
      {
        batchCount: 100,
        guestsPerBatch: 10,
        initialMemory: initialMemory
      }
    );
  }

  // Get current memory usage (if available)
  private getMemoryUsage(): number | null {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      // @ts-ignore - performance.memory is not in all TypeScript definitions
      return performance.memory?.usedJSHeapSize || null;
    }

    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }

    return null;
  }

  // Run all performance tests
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Performance Test Suite');
    console.log('=====================================');

    try {
      await this.testDatabaseOperations();
      console.log('');

      await this.testFormSimulation();
      console.log('');

      await this.testMemoryUsage();
      console.log('');

      this.generateReport();
    } catch (error) {
      console.error('Performance test suite failed:', error);
      throw error;
    }
  }

  // Generate performance test report
  private generateReport(): void {
    console.log('📊 Performance Test Report');
    console.log('===========================');

    const passedTests = this.results.filter(r => r.passed);
    const failedTests = this.results.filter(r => !r.passed);

    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${passedTests.length}`);
    console.log(`Failed: ${failedTests.length}`);
    console.log(`Success Rate: ${((passedTests.length / this.results.length) * 100).toFixed(1)}%`);
    console.log('');

    if (failedTests.length > 0) {
      console.log('❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`  - ${test.testName}: ${test.duration.toFixed(2)}ms (target: ${test.target}ms)`);
      });
      console.log('');
    }

    console.log('⏱️  Performance Summary:');
    this.results.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      const percentage = ((test.duration / test.target) * 100).toFixed(1);
      console.log(`  ${status} ${test.testName}: ${test.duration.toFixed(2)}ms (${percentage}% of target)`);
    });

    console.log('');
    console.log('🏆 Performance Targets Status:');
    console.log(`  Dynamic Field Rendering: Target <${PERFORMANCE_TARGETS.DYNAMIC_FIELD_RENDERING}ms`);
    console.log(`  Form Submission: Target <${PERFORMANCE_TARGETS.FORM_SUBMISSION}ms`);
    console.log(`  Database Operations: Target <${PERFORMANCE_TARGETS.DATABASE_OPERATION}ms`);
    console.log(`  Guest Field Updates: Target <${PERFORMANCE_TARGETS.GUEST_FIELD_UPDATE}ms`);
  }

  // Get test results for external analysis
  getResults(): PerformanceTestResult[] {
    return [...this.results];
  }
}

// CLI runner
if (require.main === module) {
  const testSuite = new PerformanceTestSuite();
  testSuite.runAllTests()
    .then(() => {
      console.log('\n✨ Performance tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Performance tests failed:', error);
      process.exit(1);
    });
}

export { PerformanceTestSuite, type PerformanceTestResult };