import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Settings,
  Info,
  Loader2
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface DatabaseStatus {
  environment: {
    isValid: boolean;
    missing: string[];
    warnings: string[];
  };
  connection: {
    status: string;
    timestamp: string;
    config: {
      hasSupabaseUrl: boolean;
      hasServiceKey: boolean;
      isProduction: boolean;
    };
    error?: string;
  };
  supabaseAdmin: boolean;
}

export function DatabaseConfig() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const { toast } = useToast();

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health/database');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch database status');
      }
    } catch (error) {
      console.error('Failed to fetch database status:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch database status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setTesting(true);
      const response = await fetch('/api/health/database/test', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Connection Test',
          description: data.data.connected 
            ? 'Database connection successful!' 
            : 'Database connection failed',
          variant: data.data.connected ? 'default' : 'destructive',
        });
        // Refresh status after test
        await fetchStatus();
      } else {
        throw new Error(data.error || 'Connection test failed');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: 'Connection Test Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const initializeDatabase = async () => {
    try {
      setInitializing(true);
      const response = await fetch('/api/health/database/init', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Database Initialized',
          description: 'Database has been successfully initialized',
        });
        await fetchStatus();
      } else {
        throw new Error(data.message || 'Database initialization failed');
      }
    } catch (error) {
      console.error('Database initialization failed:', error);
      toast({
        title: 'Initialization Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading && !status) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'CONNECTED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'DISCONNECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'NOT_CONFIGURED':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'CONNECTED':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
      case 'DISCONNECTED':
        return <Badge variant="destructive">Disconnected</Badge>;
      case 'NOT_CONFIGURED':
        return <Badge variant="secondary">Not Configured</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              <div>
                <CardTitle>Database Configuration</CardTitle>
                <CardDescription>
                  Manage your database connection and configuration
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchStatus} 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div>
            <h3 className="text-sm font-medium mb-3">Connection Status</h3>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {status && getStatusIcon(status.connection.status)}
                <div>
                  <p className="font-medium">Database Connection</p>
                  <p className="text-sm text-muted-foreground">
                    Last checked: {status ? new Date(status.connection.timestamp).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
              {status && getStatusBadge(status.connection.status)}
            </div>
          </div>

          {/* Environment Variables */}
          <div>
            <h3 className="text-sm font-medium mb-3">Environment Configuration</h3>
            <div className="space-y-2">
              {status?.connection.config && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Supabase URL:</span>
                    <Badge variant={status.connection.config.hasSupabaseUrl ? "default" : "destructive"}>
                      {status.connection.config.hasSupabaseUrl ? 'Set' : 'Missing'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Service Key:</span>
                    <Badge variant={status.connection.config.hasServiceKey ? "default" : "destructive"}>
                      {status.connection.config.hasServiceKey ? 'Set' : 'Missing'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Environment:</span>
                    <Badge variant="secondary">
                      {status.connection.config.isProduction ? 'Production' : 'Development'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Supabase Admin:</span>
                    <Badge variant={status.supabaseAdmin ? "default" : "destructive"}>
                      {status.supabaseAdmin ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Validation Issues */}
          {status?.environment && !status.environment.isValid && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <p className="font-medium mb-2">Configuration Issues:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {status.environment.missing.map((item, index) => (
                      <li key={index} className="text-sm">Missing: {item}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Connection Error */}
          {status?.connection.error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <p className="font-medium">Connection Error:</p>
                  <p className="text-sm mt-1">{status.connection.error}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings */}
          {status?.environment.warnings && status.environment.warnings.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <p className="font-medium mb-2">Warnings:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {status.environment.warnings.map((warning, index) => (
                      <li key={index} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={testConnection}
              disabled={testing}
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={initializeDatabase}
              disabled={initializing || status?.connection.status !== 'CONNECTED'}
            >
              {initializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                'Initialize Database'
              )}
            </Button>
          </div>

          {/* Setup Instructions */}
          {status?.connection.status === 'NOT_CONFIGURED' && (
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <p className="font-medium mb-2">Setup Required:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Create a Supabase project at supabase.com</li>
                    <li>Get your project URL and service role key</li>
                    <li>Set environment variables using the DevServerControl tool</li>
                    <li>Run the database initialization scripts</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
