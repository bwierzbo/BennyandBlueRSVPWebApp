import { sql } from '@vercel/postgres';
import type { RSVPRecord, RSVP, RSVPCreateData, RSVPUpdateData } from '../types';

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

  // Safely serialize guest names to JSON
  safeSerializeGuestNames: (guestNames?: string[]): string | null => {
    if (!guestNames || guestNames.length === 0) {
      return null;
    }

    try {
      return JSON.stringify(guestNames);
    } catch (error) {
      throw new Error(`Failed to serialize guest names: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Safely parse guest names from JSON
  safeParseGuestNames: (guestNamesJson: any): string[] | null => {
    if (!guestNamesJson) {
      return null;
    }

    if (typeof guestNamesJson === 'string') {
      try {
        const parsed = JSON.parse(guestNamesJson);
        if (!Array.isArray(parsed)) {
          throw new Error('Guest names JSON must contain an array');
        }
        return parsed;
      } catch (error) {
        throw new Error(`Failed to parse guest names JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (Array.isArray(guestNamesJson)) {
      return guestNamesJson; // Already parsed by PostgreSQL
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
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Create an index on email for faster lookups
      await sql`
        CREATE INDEX IF NOT EXISTS idx_rsvp_email ON rsvp(email)
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
  // Create a new RSVP entry
  create: async (rsvpData: RSVPCreateData): Promise<RSVP> => {
    try {
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

      // Safely serialize guest names
      const guestNamesJson = guestValidation.safeSerializeGuestNames(rsvpData.guestNames);

      const result = await sql`
        INSERT INTO rsvp (name, email, is_attending, number_of_guests, guest_names, notes)
        VALUES (${rsvpData.name}, ${rsvpData.email}, ${rsvpData.isAttending}, ${rsvpData.numberOfGuests}, ${guestNamesJson}, ${rsvpData.notes || null})
        RETURNING *
      `;
      return formatConverters.dbToApi(result.rows[0] as RSVPRecord);
    } catch (error) {
      console.error('Error creating RSVP:', error);
      throw new Error(`Failed to create RSVP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get RSVP by email
  getByEmail: async (email: string): Promise<RSVP | null> => {
    try {
      const result = await sql`
        SELECT * FROM rsvp WHERE email = ${email}
      `;
      const dbRecord = result.rows[0] as RSVPRecord | undefined;
      return dbRecord ? formatConverters.dbToApi(dbRecord) : null;
    } catch (error) {
      console.error('Error fetching RSVP by email:', error);
      throw new Error(`Failed to fetch RSVP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

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
  }
};

// Export the sql instance for direct queries if needed
export { sql };