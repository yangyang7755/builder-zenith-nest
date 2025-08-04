import { supabaseAdmin } from './supabase.js';

export interface DatabaseConfig {
  isConnected: boolean;
  url?: string;
  hasValidConfig: boolean;
  error?: string;
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private config: DatabaseConfig = {
    isConnected: false,
    hasValidConfig: false,
  };

  private constructor() {
    this.checkConnection();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private async checkConnection(): Promise<void> {
    try {
      // Check if Supabase is configured
      if (!supabaseAdmin) {
        this.config = {
          isConnected: false,
          hasValidConfig: false,
          error: 'Supabase not configured - missing environment variables'
        };
        return;
      }

      // Test the connection
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .limit(1);

      if (error) {
        throw error;
      }

      this.config = {
        isConnected: true,
        hasValidConfig: true,
        url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      };

      console.log('✅ Database connection successful');
    } catch (error) {
      this.config = {
        isConnected: false,
        hasValidConfig: !!supabaseAdmin,
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
      
      console.error('❌ Database connection failed:', error);
    }
  }

  public getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  public async testConnection(): Promise<DatabaseConfig> {
    await this.checkConnection();
    return this.getConfig();
  }

  public async ensureTablesExist(): Promise<boolean> {
    if (!supabaseAdmin) {
      console.error('Database not configured');
      return false;
    }

    try {
      // Check if essential tables exist
      const tables = ['profiles', 'clubs', 'activities', 'club_memberships'];
      
      for (const table of tables) {
        const { error } = await supabaseAdmin
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`Table '${table}' check failed:`, error.message);
          return false;
        }
      }

      console.log('✅ All required tables exist');
      return true;
    } catch (error) {
      console.error('❌ Table check failed:', error);
      return false;
    }
  }

  public async initializeDatabase(): Promise<boolean> {
    if (!supabaseAdmin) {
      console.error('Cannot initialize database - Supabase not configured');
      return false;
    }

    try {
      console.log('🔄 Initializing database...');
      
      // Check connection first
      const config = await this.testConnection();
      if (!config.isConnected) {
        throw new Error('Database connection failed');
      }

      // Ensure tables exist
      const tablesExist = await this.ensureTablesExist();
      if (!tablesExist) {
        console.warn('⚠️ Some database tables may be missing. Run the SQL scripts in database/ folder.');
      }

      console.log('✅ Database initialization complete');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      return false;
    }
  }

  public getConnectionStatus(): string {
    if (!this.config.hasValidConfig) {
      return 'NOT_CONFIGURED';
    }
    if (!this.config.isConnected) {
      return 'DISCONNECTED';
    }
    return 'CONNECTED';
  }

  public getHealthCheck() {
    return {
      status: this.getConnectionStatus(),
      timestamp: new Date().toISOString(),
      config: {
        hasSupabaseUrl: !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        isProduction: process.env.NODE_ENV === 'production',
      },
      error: this.config.error,
    };
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();

// Environment variable validation
export function validateEnvironmentVariables(): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} {
  const required = [
    'SUPABASE_URL',
    'VITE_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const optional = [
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables (at least one of SUPABASE_URL or VITE_SUPABASE_URL)
  const hasUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!hasUrl) {
    missing.push('SUPABASE_URL or VITE_SUPABASE_URL');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  // Check optional variables
  optional.forEach(key => {
    if (!process.env[key]) {
      warnings.push(`${key} is not set (optional but recommended)`);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

// Helper to get database status for debugging
export async function getDatabaseStatus() {
  const manager = DatabaseManager.getInstance();
  const envValidation = validateEnvironmentVariables();
  const healthCheck = manager.getHealthCheck();
  
  return {
    environment: envValidation,
    connection: healthCheck,
    supabaseAdmin: !!supabaseAdmin,
  };
}
