#!/usr/bin/env tsx

/**
 * Comprehensive test suite for admin database functionality
 * Tests the new getAllForAdmin() and getAdminStats() functions
 */

import { rsvpDb } from '../lib/db';
import type { RSVP, AdminRSVPData, AdminRSVPStats } from '../types';
import { PERFORMANCE_TARGETS } from '../lib/performance';

interface TestResult {
  name: string;
  passed: boolean;
  duration?: number;
  error?: string;
  details?: any;
}

class AdminDatabaseTester {
  private results: TestResult[] = [];
  private testData: RSVP[] = [];

  private readonly TEST_DATASETS = {
    performance: Array.from({ length: 50 }, (_, i) => ({
      name: `Test Guest ${i + 1}`,
      email: `test${i + 1}@example.com`,
      isAttending: Math.random() > 0.3, // 70% attending rate
      numberOfGuests: Math.floor(Math.random() * 4) + 1, // 1-4 guests
      guestNames: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => `Guest ${i + 1}-${j + 1}`),
      notes: Math.random() > 0.7 ? `Test notes for guest ${i + 1}` : undefined
    })),

    errorHandling: [
      {
        name: 'Error Test User',
        email: 'error@example.com',
        isAttending: true,
        numberOfGuests: 15, // Exceeds guest limit
        guestNames: Array.from({ length: 15 }, (_, i) => `Guest ${i + 1}`),
        notes: 'This should fail validation'
      }
    ],

    analytics: [
      { name: 'Attending Solo', email: 'solo1@test.com', isAttending: true, numberOfGuests: 1, guestNames: ['Solo Guest'] },
      { name: 'Attending Couple', email: 'couple1@test.com', isAttending: true, numberOfGuests: 2, guestNames: ['Guest 1', 'Guest 2'] },
      { name: 'Attending Family', email: 'family1@test.com', isAttending: true, numberOfGuests: 4, guestNames: ['Parent 1', 'Parent 2', 'Child 1', 'Child 2'] },
      { name: 'Not Attending 1', email: 'no1@test.com', isAttending: false, numberOfGuests: 2, guestNames: [] },
      { name: 'Not Attending 2', email: 'no2@test.com', isAttending: false, numberOfGuests: 1, guestNames: [] }
    ]
  };

  async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const start = Date.now();
    try {
      await testFn();
      const duration = Date.now() - start;
      this.results.push({ name, passed: true, duration });
      console.log(`✅ ${name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - start;
      this.results.push({
        name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`❌ ${name} (${duration}ms): ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async testDatabaseConnection(): Promise<void> {
    await this.runTest('Database Connection', async () => {
      const stats = await rsvpDb.getStats();
      if (!stats || typeof stats.total_responses !== 'number') {
        throw new Error('Database connection failed or returned invalid data');
      }
    });
  }

  async testPerformanceBenchmarks(): Promise<void> {
    await this.runTest('getAllForAdmin Performance', async () => {
      const start = Date.now();
      const data = await rsvpDb.getAllForAdmin();
      const duration = Date.now() - start;

      if (duration > PERFORMANCE_TARGETS.DATABASE_OPERATION) {
        throw new Error(`Query exceeded performance target: ${duration}ms > ${PERFORMANCE_TARGETS.DATABASE_OPERATION}ms`);
      }

      if (!data.rsvps || !Array.isArray(data.rsvps)) {
        throw new Error('getAllForAdmin returned invalid data structure');
      }

      if (!data.analytics || typeof data.analytics.totalResponses !== 'number') {
        throw new Error('getAllForAdmin returned invalid analytics');
      }

      if (!data.performance || typeof data.performance.queryTime !== 'number') {
        throw new Error('getAllForAdmin returned invalid performance metrics');
      }
    });

    await this.runTest('getAdminStats Performance', async () => {
      const start = Date.now();
      const stats = await rsvpDb.getAdminStats();
      const duration = Date.now() - start;

      if (duration > PERFORMANCE_TARGETS.DATABASE_OPERATION) {
        throw new Error(`Query exceeded performance target: ${duration}ms > ${PERFORMANCE_TARGETS.DATABASE_OPERATION}ms`);
      }

      if (!stats || typeof stats.total_responses !== 'number') {
        throw new Error('getAdminStats returned invalid data structure');
      }

      if (!stats.guest_breakdown || typeof stats.guest_breakdown.solo_attendees !== 'number') {
        throw new Error('getAdminStats returned invalid guest breakdown');
      }

      if (!stats.submission_timeline || typeof stats.submission_timeline.last_7_days !== 'number') {
        throw new Error('getAdminStats returned invalid submission timeline');
      }
    });
  }

  async testErrorHandling(): Promise<void> {
    await this.runTest('Invalid Email Query', async () => {
      const result = await rsvpDb.getByEmail('nonexistent@example.com');
      if (result !== null) {
        throw new Error('Expected null for nonexistent email');
      }
    });

    await this.runTest('Empty Database Handling', async () => {
      // Test with current data - should not throw errors
      const adminData = await rsvpDb.getAllForAdmin();
      const adminStats = await rsvpDb.getAdminStats();

      // Both should return valid structures even with no data
      if (!adminData.analytics || !adminStats.guest_breakdown) {
        throw new Error('Functions failed with empty/minimal data');
      }
    });
  }

  async testAnalyticsAccuracy(): Promise<void> {
    await this.runTest('Analytics Calculations', async () => {
      const adminData = await rsvpDb.getAllForAdmin();
      const adminStats = await rsvpDb.getAdminStats();
      const basicStats = await rsvpDb.getStats();

      // Cross-validate basic stats
      if (adminData.analytics.totalResponses !== Number(basicStats.total_responses)) {
        throw new Error(`Total responses mismatch: ${adminData.analytics.totalResponses} vs ${basicStats.total_responses}`);
      }

      if (adminData.analytics.attendingCount !== Number(basicStats.attending_count)) {
        throw new Error(`Attending count mismatch: ${adminData.analytics.attendingCount} vs ${basicStats.attending_count}`);
      }

      if (adminData.analytics.totalGuests !== Number(basicStats.total_guests)) {
        throw new Error(`Total guests mismatch: ${adminData.analytics.totalGuests} vs ${basicStats.total_guests}`);
      }

      // Validate attendance rate calculation
      const expectedAttendanceRate = adminData.analytics.totalResponses > 0
        ? (adminData.analytics.attendingCount / adminData.analytics.totalResponses) * 100
        : 0;

      if (Math.abs(adminData.analytics.attendanceRate - expectedAttendanceRate) > 0.01) {
        throw new Error(`Attendance rate calculation error: ${adminData.analytics.attendanceRate} vs ${expectedAttendanceRate}`);
      }

      // Validate average guests calculation
      const expectedAverage = adminData.analytics.totalResponses > 0
        ? adminData.analytics.totalGuests / adminData.analytics.totalResponses
        : 0;

      if (Math.abs(adminData.analytics.averageGuestsPerRSVP - expectedAverage) > 0.01) {
        throw new Error(`Average guests calculation error: ${adminData.analytics.averageGuestsPerRSVP} vs ${expectedAverage}`);
      }
    });
  }

  async testDataIntegrityAndFormat(): Promise<void> {
    await this.runTest('Data Format Consistency', async () => {
      const adminData = await rsvpDb.getAllForAdmin();
      const allRsvps = await rsvpDb.getAll();

      // Should have same number of records
      if (adminData.rsvps.length !== allRsvps.length) {
        throw new Error(`Record count mismatch: admin ${adminData.rsvps.length} vs standard ${allRsvps.length}`);
      }

      // Records should be in same order (both ordered by created_at DESC)
      for (let i = 0; i < Math.min(5, adminData.rsvps.length); i++) {
        if (adminData.rsvps[i].id !== allRsvps[i].id) {
          throw new Error(`Record order mismatch at index ${i}: ${adminData.rsvps[i].id} vs ${allRsvps[i].id}`);
        }
      }

      // Validate RSVP format consistency
      for (const rsvp of adminData.rsvps.slice(0, 3)) {
        if (!rsvp.id || !rsvp.name || !rsvp.email || typeof rsvp.isAttending !== 'boolean') {
          throw new Error(`Invalid RSVP format: ${JSON.stringify(rsvp)}`);
        }

        if (!rsvp.createdAt || !rsvp.updatedAt) {
          throw new Error(`Missing timestamps in RSVP: ${rsvp.id}`);
        }
      }
    });
  }

  async testAdminFunctionality(): Promise<void> {
    await this.runTest('Admin Functions Exist', async () => {
      if (typeof rsvpDb.getAllForAdmin !== 'function') {
        throw new Error('getAllForAdmin function not found');
      }

      if (typeof rsvpDb.getAdminStats !== 'function') {
        throw new Error('getAdminStats function not found');
      }
    });

    await this.runTest('Admin Data Structure', async () => {
      const adminData = await rsvpDb.getAllForAdmin();

      // Validate required structure
      const requiredFields = ['rsvps', 'analytics', 'performance'];
      for (const field of requiredFields) {
        if (!(field in adminData)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate analytics structure
      const requiredAnalytics: (keyof typeof adminData.analytics)[] = [
        'totalResponses', 'attendingCount', 'notAttendingCount',
        'totalGuests', 'attendanceRate', 'averageGuestsPerRSVP', 'recentSubmissions'
      ];
      for (const field of requiredAnalytics) {
        if (!(field in adminData.analytics) || typeof adminData.analytics[field] !== 'number') {
          throw new Error(`Missing or invalid analytics field: ${field}`);
        }
      }

      // Validate performance structure
      if (typeof adminData.performance.queryTime !== 'number' || typeof adminData.performance.recordCount !== 'number') {
        throw new Error('Invalid performance metrics structure');
      }
    });
  }

  async testCleanup(): Promise<void> {
    // Clean up any test data if we created any
    console.log('🧹 Cleanup: No test data to clean (read-only tests)');
  }

  generateReport(): void {
    console.log('\n📊 Test Report Summary:');
    console.log('========================');

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.name}: ${result.error}`);
      });
    }

    const avgDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0) / total;
    console.log(`\nAverage Test Duration: ${avgDuration.toFixed(1)}ms`);

    const slowTests = this.results.filter(r => (r.duration || 0) > 100);
    if (slowTests.length > 0) {
      console.log('\n⚠️  Slow Tests (>100ms):');
      slowTests.forEach(test => {
        console.log(`  - ${test.name}: ${test.duration}ms`);
      });
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Admin Database Test Suite');
    console.log('=====================================\n');

    // Core functionality tests
    await this.testDatabaseConnection();
    await this.testAdminFunctionality();

    // Performance tests
    await this.testPerformanceBenchmarks();

    // Data integrity tests
    await this.testDataIntegrityAndFormat();

    // Analytics accuracy tests
    await this.testAnalyticsAccuracy();

    // Error handling tests
    await this.testErrorHandling();

    // Cleanup
    await this.testCleanup();

    // Generate report
    this.generateReport();

    // Exit with appropriate code
    const failed = this.results.filter(r => !r.passed).length;
    if (failed > 0) {
      console.log(`\n💥 ${failed} test(s) failed!`);
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    }
  }
}

// Run the tests
const tester = new AdminDatabaseTester();
tester.runAllTests().catch((error) => {
  console.error('💥 Test suite crashed:', error);
  process.exit(1);
});