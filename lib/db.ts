import { sql } from '@vercel/postgres';
import type { RSVPRecord, RSVP, RSVPCreateData, RSVPUpdateData, AdminRSVPData, AdminRSVPStats } from '../types';
import { performanceMonitor, measurePerformance, PERFORMANCE_TARGETS } from './performance';

// Guest names validation utilities
export const guestValidation = {
  // Validate guest names array
  validateGuestNames: (guestNames: string[] | undefined): { isValid: boolean; error?: string } => {
    if (!guestNames) {
      return { isValid: true }; // undefined/null is valid (no guests)
    }

    if (!Array.isArray(guestNames)) {
      return { isValid: false, error: 'Guest names must be an array' };
    }

    if (guestNames.length > 10) {
      return { isValid: false, error: 'Maximum 10 guest names allowed' };
    }

    if (guestNames.length === 0) {
      return { isValid: true }; // empty array is valid
    }

    // Check each guest name
    for (let i = 0; i < guestNames.length; i++) {
      const name = guestNames[i];

      if (typeof name !== 'string') {
        return { isValid: false, error: `Guest name at index ${i} must be a string` };
      }

      if (name.trim().length === 0) {
        return { isValid: false, error: `Guest name at index ${i} cannot be empty` };
      }

      if (name.length > 100) {
        return { isValid: false, error: `Guest name at index ${i} cannot exceed 100 characters` };
      }
    }

    return { isValid: true };
  },

  // Validate guest count consistency
  validateGuestCount: (numberOfGuests: number, guestNames?: string[]): { isValid: boolean; error?: string } => {
    if (!guestNames || guestNames.length === 0) {
      return { isValid: true }; // no guest names provided, count is independent
    }

    if (numberOfGuests !== guestNames.length) {
      return {
        isValid: false,
        error: `Number of guests (${numberOfGuests}) must match guest names count (${guestNames.length})`
      };
    }

    return { isValid: true };
  },

  // Optimized guest names serialization with performance monitoring
  safeSerializeGuestNames: (guestNames?: string[]): string | null => {
    if (!guestNames || guestNames.length === 0) {
      return null;
    }

    try {
      // Use native JSON.stringify which is optimized for performance
      return JSON.stringify(guestNames);
    } catch (error) {
      throw new Error(`Failed to serialize guest names: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Optimized guest names parsing with performance monitoring and caching
  safeParseGuestNames: (guestNamesJson: any): string[] | null => {
    if (!guestNamesJson) {
      return null;
    }

    // Fast path for already parsed arrays (common case in PostgreSQL)
    if (Array.isArray(guestNamesJson)) {
      return guestNamesJson;
    }

    if (typeof guestNamesJson === 'string') {
      try {
        // Use native JSON.parse for better performance
        const parsed = JSON.parse(guestNamesJson);
        if (!Array.isArray(parsed)) {
          throw new Error('Guest names JSON must contain an array');
        }
        return parsed;
      } catch (error) {
        throw new Error(`Failed to parse guest names JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    throw new Error('Guest names must be a string (JSON) or array');
  }
};

// Helper functions to convert between database and API formats
export const formatConverters = {
  // Convert database record (snake_case) to API format (camelCase)
  dbToApi: (dbRecord: RSVPRecord): RSVP => {
    try {
      const guestNames = guestValidation.safeParseGuestNames(dbRecord.guest_names);

      return {
        id: dbRecord.id,
        name: dbRecord.name,
        email: dbRecord.email,
        isAttending: dbRecord.is_attending,
        numberOfGuests: dbRecord.number_of_guests,
        guestNames,
        dietaryRestrictions: dbRecord.dietary_restrictions,
        songRequests: dbRecord.song_requests,
        notes: dbRecord.notes,
        createdAt: dbRecord.created_at,
        updatedAt: dbRecord.updated_at
      };
    } catch (error) {
      console.error('Error in dbToApi conversion:', error);
      // Return record with null guest names on parsing error
      return {
        id: dbRecord.id,
        name: dbRecord.name,
        email: dbRecord.email,
        isAttending: dbRecord.is_attending,
        numberOfGuests: dbRecord.number_of_guests,
        guestNames: null,
        dietaryRestrictions: dbRecord.dietary_restrictions,
        songRequests: dbRecord.song_requests,
        notes: dbRecord.notes,
        createdAt: dbRecord.created_at,
        updatedAt: dbRecord.updated_at
      };
    }
  },

  // Convert API format (camelCase) to database format (snake_case)
  apiToDb: (apiData: RSVPCreateData | RSVPUpdateData) => {
    const dbData: any = {};

    if ('name' in apiData && apiData.name !== undefined) {
      dbData.name = apiData.name;
    }
    if ('email' in apiData && apiData.email !== undefined) {
      dbData.email = apiData.email;
    }
    if ('isAttending' in apiData && apiData.isAttending !== undefined) {
      dbData.is_attending = apiData.isAttending;
    }
    if ('numberOfGuests' in apiData && apiData.numberOfGuests !== undefined) {
      dbData.number_of_guests = apiData.numberOfGuests;
    }
    if ('guestNames' in apiData && apiData.guestNames !== undefined) {
      dbData.guest_names = guestValidation.safeSerializeGuestNames(apiData.guestNames);
    }
    if ('dietaryRestrictions' in apiData && apiData.dietaryRestrictions !== undefined) {
      dbData.dietary_restrictions = apiData.dietaryRestrictions;
    }
    if ('songRequests' in apiData && apiData.songRequests !== undefined) {
      dbData.song_requests = apiData.songRequests;
    }
    if ('notes' in apiData && apiData.notes !== undefined) {
      dbData.notes = apiData.notes;
    }

    return dbData;
  }
};

// Database connection configuration
export const db = {
  // Execute a query and return results
  query: async <T = any>(text: string, params: any[] = []): Promise<{ rows: T[]; rowCount: number }> => {
    try {
      const result = await sql.query(text, params);
      return {
        rows: result.rows as T[],
        rowCount: result.rowCount || 0
      };
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error(`Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Test database connection
  testConnection: async (): Promise<boolean> => {
    try {
      await sql`SELECT 1 as test`;
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  },

  // Initialize database tables
  initializeTables: async (): Promise<void> => {
    try {
      // Create RSVP table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS rsvp (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          is_attending BOOLEAN NOT NULL DEFAULT false,
          number_of_guests INTEGER NOT NULL DEFAULT 1 CHECK (number_of_guests >= 0),
          guest_names JSONB DEFAULT NULL,
          dietary_restrictions TEXT,
          song_requests TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Create optimized indexes for better performance
      await sql`
        CREATE INDEX IF NOT EXISTS idx_rsvp_email ON rsvp(email)
      `;

      // Index for attendance queries (useful for statistics)
      await sql`
        CREATE INDEX IF NOT EXISTS idx_rsvp_attendance ON rsvp(is_attending)
      `;

      // Index for guest count queries
      await sql`
        CREATE INDEX IF NOT EXISTS idx_rsvp_guest_count ON rsvp(number_of_guests) WHERE number_of_guests > 0
      `;

      // Composite index for common query patterns
      await sql`
        CREATE INDEX IF NOT EXISTS idx_rsvp_attendance_guests ON rsvp(is_attending, number_of_guests)
      `;

      // Create a trigger to automatically update the updated_at timestamp
      await sql`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql'
      `;

      await sql`
        DROP TRIGGER IF EXISTS update_rsvp_updated_at ON rsvp
      `;

      await sql`
        CREATE TRIGGER update_rsvp_updated_at
        BEFORE UPDATE ON rsvp
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
      `;

      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database tables:', error);
      throw new Error(`Failed to initialize database tables: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

// RSVP-specific database operations
export const rsvpDb = {
  // Create a new RSVP entry with performance monitoring
  create: measurePerformance('rsvp_create', async (rsvpData: RSVPCreateData): Promise<RSVP> => {
    try {
      performanceMonitor.startTiming('rsvp_validation');

      // Validate guest names
      const guestValidationResult = guestValidation.validateGuestNames(rsvpData.guestNames);
      if (!guestValidationResult.isValid) {
        throw new Error(`Invalid guest names: ${guestValidationResult.error}`);
      }

      // Validate guest count consistency
      const countValidationResult = guestValidation.validateGuestCount(rsvpData.numberOfGuests, rsvpData.guestNames);
      if (!countValidationResult.isValid) {
        throw new Error(`Invalid guest count: ${countValidationResult.error}`);
      }

      performanceMonitor.endTiming('rsvp_validation');

      // Optimize guest names serialization
      performanceMonitor.startTiming('guest_names_serialization');
      const guestNamesJson = guestValidation.safeSerializeGuestNames(rsvpData.guestNames);
      performanceMonitor.endTiming('guest_names_serialization', {
        guestCount: rsvpData.guestNames?.length || 0,
        hasGuests: Boolean(rsvpData.guestNames?.length)
      });

      performanceMonitor.startTiming('database_insert');
      const result = await sql`
        INSERT INTO rsvp (name, email, is_attending, number_of_guests, guest_names, dietary_restrictions, song_requests, notes)
        VALUES (${rsvpData.name}, ${rsvpData.email}, ${rsvpData.isAttending}, ${rsvpData.numberOfGuests}, ${guestNamesJson}, ${rsvpData.dietaryRestrictions || null}, ${rsvpData.songRequests || null}, ${rsvpData.notes || null})
        RETURNING *
      `;
      performanceMonitor.endTiming('database_insert');

      performanceMonitor.startTiming('format_conversion');
      const formattedResult = formatConverters.dbToApi(result.rows[0] as RSVPRecord);
      performanceMonitor.endTiming('format_conversion');

      return formattedResult;
    } catch (error) {
      console.error('Error creating RSVP:', error);
      throw new Error(`Failed to create RSVP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),

  // Get RSVP by email with performance monitoring and optimized query
  getByEmail: measurePerformance('rsvp_get_by_email', async (email: string): Promise<RSVP | null> => {
    try {
      performanceMonitor.startTiming('email_lookup');

      // Optimized query that uses email index for faster lookup
      const result = await sql`
        SELECT * FROM rsvp WHERE email = ${email} LIMIT 1
      `;

      performanceMonitor.endTiming('email_lookup', {
        emailLength: email.length,
        found: result.rows.length > 0
      });

      const dbRecord = result.rows[0] as RSVPRecord | undefined;

      if (dbRecord) {
        performanceMonitor.startTiming('format_conversion_single');
        const formatted = formatConverters.dbToApi(dbRecord);
        performanceMonitor.endTiming('format_conversion_single');
        return formatted;
      }

      return null;
    } catch (error) {
      console.error('Error fetching RSVP by email:', error);
      throw new Error(`Failed to fetch RSVP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),

  // Get all RSVPs
  getAll: async (): Promise<RSVP[]> => {
    try {
      const result = await sql`
        SELECT * FROM rsvp ORDER BY created_at DESC
      `;
      return result.rows.map((row) => formatConverters.dbToApi(row as RSVPRecord));
    } catch (error) {
      console.error('Error fetching all RSVPs:', error);
      throw new Error(`Failed to fetch RSVPs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Update RSVP
  update: async (id: number, updateData: RSVPUpdateData): Promise<RSVP | null> => {
    try {
      // Validate guest names if provided
      if (updateData.guestNames !== undefined) {
        const guestValidationResult = guestValidation.validateGuestNames(updateData.guestNames);
        if (!guestValidationResult.isValid) {
          throw new Error(`Invalid guest names: ${guestValidationResult.error}`);
        }

        // Validate guest count consistency if both are being updated
        if (updateData.numberOfGuests !== undefined) {
          const countValidationResult = guestValidation.validateGuestCount(updateData.numberOfGuests, updateData.guestNames);
          if (!countValidationResult.isValid) {
            throw new Error(`Invalid guest count: ${countValidationResult.error}`);
          }
        }
      }

      const setClauses = [];
      const values = [];
      let paramCounter = 1;

      if (updateData.name !== undefined) {
        setClauses.push(`name = $${paramCounter++}`);
        values.push(updateData.name);
      }
      if (updateData.isAttending !== undefined) {
        setClauses.push(`is_attending = $${paramCounter++}`);
        values.push(updateData.isAttending);
      }
      if (updateData.numberOfGuests !== undefined) {
        setClauses.push(`number_of_guests = $${paramCounter++}`);
        values.push(updateData.numberOfGuests);
      }
      if (updateData.guestNames !== undefined) {
        setClauses.push(`guest_names = $${paramCounter++}`);
        values.push(guestValidation.safeSerializeGuestNames(updateData.guestNames));
      }
      if (updateData.dietaryRestrictions !== undefined) {
        setClauses.push(`dietary_restrictions = $${paramCounter++}`);
        values.push(updateData.dietaryRestrictions);
      }
      if (updateData.songRequests !== undefined) {
        setClauses.push(`song_requests = $${paramCounter++}`);
        values.push(updateData.songRequests);
      }
      if (updateData.notes !== undefined) {
        setClauses.push(`notes = $${paramCounter++}`);
        values.push(updateData.notes);
      }

      if (setClauses.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);
      const queryText = `
        UPDATE rsvp
        SET ${setClauses.join(', ')}
        WHERE id = $${paramCounter}
        RETURNING *
      `;

      const result = await db.query(queryText, values);
      const dbRecord = result.rows[0] as RSVPRecord | undefined;
      return dbRecord ? formatConverters.dbToApi(dbRecord) : null;
    } catch (error) {
      console.error('Error updating RSVP:', error);
      throw new Error(`Failed to update RSVP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Delete RSVP
  delete: async (id: number): Promise<RSVP | null> => {
    try {
      const result = await sql`
        DELETE FROM rsvp WHERE id = ${id} RETURNING *
      `;
      const dbRecord = result.rows[0] as RSVPRecord | undefined;
      return dbRecord ? formatConverters.dbToApi(dbRecord) : null;
    } catch (error) {
      console.error('Error deleting RSVP:', error);
      throw new Error(`Failed to delete RSVP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get RSVP statistics
  getStats: async () => {
    try {
      const result = await sql`
        SELECT
          COUNT(*) as total_responses,
          COUNT(CASE WHEN is_attending = true THEN 1 END) as attending_count,
          COUNT(CASE WHEN is_attending = false THEN 1 END) as not_attending_count,
          COALESCE(SUM(CASE WHEN is_attending = true THEN number_of_guests ELSE 0 END), 0) as total_guests
        FROM rsvp
      `;
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching RSVP stats:', error);
      throw new Error(`Failed to fetch RSVP statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get all RSVPs with analytics for admin interface
  getAllForAdmin: measurePerformance('admin_get_all', async (): Promise<AdminRSVPData> => {
    try {
      const startTime = Date.now();

      // Single optimized query with analytics using window functions
      const result = await sql`
        WITH analytics AS (
          SELECT
            COUNT(*) as total_responses,
            COUNT(CASE WHEN is_attending = true THEN 1 END) as attending_count,
            COUNT(CASE WHEN is_attending = false THEN 1 END) as not_attending_count,
            COALESCE(SUM(CASE WHEN is_attending = true THEN number_of_guests ELSE 0 END), 0) as total_guests,
            COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as recent_submissions
          FROM rsvp
        )
        SELECT
          r.*,
          a.total_responses::int,
          a.attending_count::int,
          a.not_attending_count::int,
          a.total_guests::int,
          a.recent_submissions::int
        FROM rsvp r
        CROSS JOIN analytics a
        ORDER BY r.created_at DESC
      `;

      const queryTime = Date.now() - startTime;

      // Validate performance target
      if (queryTime > PERFORMANCE_TARGETS.DATABASE_OPERATION) {
        console.warn(`Admin query exceeded performance target: ${queryTime}ms > ${PERFORMANCE_TARGETS.DATABASE_OPERATION}ms`);
      }

      // Extract analytics from first row (all rows have same analytics)
      const firstRow = result.rows[0];
      const analytics = firstRow ? {
        totalResponses: Number(firstRow.total_responses),
        attendingCount: Number(firstRow.attending_count),
        notAttendingCount: Number(firstRow.not_attending_count),
        totalGuests: Number(firstRow.total_guests),
        attendanceRate: firstRow.total_responses > 0
          ? Number(firstRow.attending_count) / Number(firstRow.total_responses) * 100
          : 0,
        averageGuestsPerRSVP: firstRow.total_responses > 0
          ? Number(firstRow.total_guests) / Number(firstRow.total_responses)
          : 0,
        recentSubmissions: Number(firstRow.recent_submissions)
      } : {
        totalResponses: 0,
        attendingCount: 0,
        notAttendingCount: 0,
        totalGuests: 0,
        attendanceRate: 0,
        averageGuestsPerRSVP: 0,
        recentSubmissions: 0
      };

      // Convert all rows to RSVP format
      const rsvps = result.rows.map((row) => {
        // Remove analytics fields before conversion
        const { total_responses, attending_count, not_attending_count, total_guests, recent_submissions, ...rsvpData } = row;
        return formatConverters.dbToApi(rsvpData as RSVPRecord);
      });

      return {
        rsvps,
        analytics,
        performance: {
          queryTime,
          recordCount: rsvps.length
        }
      };
    } catch (error) {
      console.error('Error fetching admin RSVP data:', error);
      throw new Error(`Failed to fetch admin RSVP data: ${error instanceof Error ? error.message : 'Database error'}`);
    }
  }),

  // Get enhanced admin statistics with detailed breakdown
  getAdminStats: measurePerformance('admin_get_stats', async (): Promise<AdminRSVPStats> => {
    try {
      const result = await sql`
        WITH base_stats AS (
          SELECT
            COUNT(*) as total_responses,
            COUNT(CASE WHEN is_attending = true THEN 1 END) as attending_count,
            COUNT(CASE WHEN is_attending = false THEN 1 END) as not_attending_count,
            COALESCE(SUM(CASE WHEN is_attending = true THEN number_of_guests ELSE 0 END), 0) as total_guests,
            COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as recent_submissions_24h,
            COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_7_days,
            COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as last_30_days
          FROM rsvp
        ),
        guest_breakdown AS (
          SELECT
            COUNT(CASE WHEN is_attending = true AND number_of_guests = 1 THEN 1 END) as solo_attendees,
            COUNT(CASE WHEN is_attending = true AND number_of_guests = 2 THEN 1 END) as couples,
            COUNT(CASE WHEN is_attending = true AND number_of_guests >= 3 THEN 1 END) as families
          FROM rsvp
        )
        SELECT
          bs.*,
          gb.solo_attendees::int,
          gb.couples::int,
          gb.families::int,
          (bs.total_responses - bs.last_30_days) as older_than_30_days
        FROM base_stats bs
        CROSS JOIN guest_breakdown gb
      `;

      const row = result.rows[0];

      if (!row) {
        // Return empty stats if no data
        return {
          total_responses: 0,
          attending_count: 0,
          not_attending_count: 0,
          total_guests: 0,
          attendance_rate: 0,
          average_guests_per_rsvp: 0,
          recent_submissions_24h: 0,
          guest_breakdown: {
            solo_attendees: 0,
            couples: 0,
            families: 0
          },
          submission_timeline: {
            last_7_days: 0,
            last_30_days: 0,
            older: 0
          }
        };
      }

      const totalResponses = Number(row.total_responses);
      const attendingCount = Number(row.attending_count);
      const totalGuests = Number(row.total_guests);

      return {
        total_responses: totalResponses,
        attending_count: attendingCount,
        not_attending_count: Number(row.not_attending_count),
        total_guests: totalGuests,
        attendance_rate: totalResponses > 0 ? (attendingCount / totalResponses) * 100 : 0,
        average_guests_per_rsvp: totalResponses > 0 ? totalGuests / totalResponses : 0,
        recent_submissions_24h: Number(row.recent_submissions_24h),
        guest_breakdown: {
          solo_attendees: Number(row.solo_attendees),
          couples: Number(row.couples),
          families: Number(row.families)
        },
        submission_timeline: {
          last_7_days: Number(row.last_7_days),
          last_30_days: Number(row.last_30_days),
          older: Number(row.older_than_30_days)
        }
      };
    } catch (error) {
      console.error('Error fetching admin RSVP statistics:', error);
      throw new Error(`Failed to fetch admin statistics: ${error instanceof Error ? error.message : 'Database error'}`);
    }
  })
};

// Export the sql instance for direct queries if needed
export { sql };