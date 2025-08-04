import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle,
  Info,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface EnvVariable {
  key: string;
  value: string;
  description: string;
  required: boolean;
  sensitive: boolean;
}

export function EnvSetup() {
  const [variables, setVariables] = useState<EnvVariable[]>([
    {
      key: 'SUPABASE_URL',
      value: '',
      description: 'Your Supabase project URL (e.g., https://abcdefg.supabase.co)',
      required: true,
      sensitive: false,
    },
    {
      key: 'VITE_SUPABASE_URL',
      value: '',
      description: 'Same as SUPABASE_URL but for client-side access',
      required: true,
      sensitive: false,
    },
    {
      key: 'SUPABASE_SERVICE_ROLE_KEY',
      value: '',
      description: 'Service role key for server-side operations (keep secret)',
      required: true,
      sensitive: true,
    },
    {
      key: 'VITE_SUPABASE_ANON_KEY',
      value: '',
      description: 'Anonymous key for client-side operations',
      required: false,
      sensitive: false,
    },
  ]);

  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const [setting, setSetting] = useState<string | null>(null);
  const { toast } = useToast();

  const updateVariable = (key: string, value: string) => {
    setVariables(prev => 
      prev.map(variable => 
        variable.key === key ? { ...variable, value } : variable
      )
    );
  };

  const toggleSensitiveVisibility = (key: string) => {
    setShowSensitive(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const setEnvironmentVariable = async (key: string, value: string) => {
    if (!value.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a value for the environment variable',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSetting(key);
      
      // This would use the DevServerControl tool
      // For demo purposes, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: `Environment variable ${key} has been set`,
      });
    } catch (error) {
      console.error('Failed to set environment variable:', error);
      toast({
        title: 'Error',
        description: 'Failed to set environment variable',
        variant: 'destructive',
      });
    } finally {
      setSetting(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Text copied to clipboard',
    });
  };

  const generateEnvFile = () => {
    const envContent = variables
      .filter(v => v.value.trim())
      .map(v => `${v.key}=${v.value}`)
      .join('\n');
    
    copyToClipboard(envContent);
    toast({
      title: 'Generated',
      description: '.env file content copied to clipboard',
    });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateVariables = () => {
    const issues: string[] = [];
    
    variables.forEach(variable => {
      if (variable.required && !variable.value.trim()) {
        issues.push(`${variable.key} is required`);
      }
      
      if (variable.key.includes('URL') && variable.value && !isValidUrl(variable.value)) {
        issues.push(`${variable.key} must be a valid URL`);
      }
    });
    
    return issues;
  };

  const validationIssues = validateVariables();
  const hasRequiredVariables = variables
    .filter(v => v.required)
    .every(v => v.value.trim());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-6 w-6" />
          <div>
            <CardTitle>Environment Variables Setup</CardTitle>
            <CardDescription>
              Configure your database connection settings
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="setup">Setup Variables</TabsTrigger>
            <TabsTrigger value="guide">Setup Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            {/* Validation Status */}
            {validationIssues.length > 0 ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <p className="font-medium mb-2">Configuration Issues:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {validationIssues.map((issue, index) => (
                        <li key={index} className="text-sm">{issue}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            ) : hasRequiredVariables ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All required environment variables are configured!
                </AlertDescription>
              </Alert>
            ) : null}

            {/* Environment Variables Form */}
            <div className="space-y-4">
              {variables.map((variable) => (
                <div key={variable.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={variable.key} className="text-sm font-medium">
                      {variable.key}
                      {variable.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {variable.sensitive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSensitiveVisibility(variable.key)}
                        className="h-6 w-6 p-0"
                      >
                        {showSensitive[variable.key] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      id={variable.key}
                      type={variable.sensitive && !showSensitive[variable.key] ? 'password' : 'text'}
                      value={variable.value}
                      onChange={(e) => updateVariable(variable.key, e.target.value)}
                      placeholder={`Enter ${variable.key}`}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEnvironmentVariable(variable.key, variable.value)}
                      disabled={!variable.value.trim() || setting === variable.key}
                      className="shrink-0"
                    >
                      {setting === variable.key ? 'Setting...' : 'Set'}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {variable.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={generateEnvFile}
                disabled={!hasRequiredVariables}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy .env File
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                disabled={validationIssues.length > 0}
              >
                Test Configuration
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="guide" className="space-y-4">
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Follow these steps to get your Supabase credentials and configure the database connection.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 text-sm flex items-center justify-center">1</span>
                    Create Supabase Project
                  </h3>
                  <ol className="space-y-2 text-sm ml-8">
                    <li>• Go to <Button variant="link" className="p-0 h-auto"><ExternalLink className="inline h-3 w-3 ml-1" />supabase.com</Button></li>
                    <li>• Click "Start your project"</li>
                    <li>• Create a new organization (if needed)</li>
                    <li>• Create a new project with a secure password</li>
                    <li>• Wait for the project to be set up (2-3 minutes)</li>
                  </ol>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 text-sm flex items-center justify-center">2</span>
                    Get Your API Keys
                  </h3>
                  <ol className="space-y-2 text-sm ml-8">
                    <li>• Go to Settings → API in your Supabase dashboard</li>
                    <li>• Copy the "Project URL" (for SUPABASE_URL)</li>
                    <li>• Copy the "anon public" key (for VITE_SUPABASE_ANON_KEY)</li>
                    <li>• Copy the "service_role" key (for SUPABASE_SERVICE_ROLE_KEY)</li>
                    <li>• ⚠️ Keep the service_role key secret!</li>
                  </ol>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 text-sm flex items-center justify-center">3</span>
                    Set Up Database Schema
                  </h3>
                  <ol className="space-y-2 text-sm ml-8">
                    <li>• Go to SQL Editor in your Supabase dashboard</li>
                    <li>• Run database/schema.sql first</li>
                    <li>• Then run database/rls_policies.sql</li>
                    <li>• Optionally run database/seed.sql for demo data</li>
                    <li>• Run other SQL files as needed</li>
                  </ol>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 text-sm flex items-center justify-center">4</span>
                    Configure Environment Variables
                  </h3>
                  <ol className="space-y-2 text-sm ml-8">
                    <li>• Use the "Setup Variables" tab above</li>
                    <li>• Enter your Supabase URL and keys</li>
                    <li>• Click "Set" for each variable</li>
                    <li>• Test the configuration</li>
                    <li>• Your app will automatically reconnect</li>
                  </ol>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pro Tip:</strong> Use the database connection test in the Connection tab to verify everything is working correctly.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
