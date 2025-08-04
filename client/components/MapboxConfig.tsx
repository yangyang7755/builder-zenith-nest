import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Map, 
  Key, 
  ExternalLink, 
  Copy, 
  Eye, 
  EyeOff, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export function MapboxConfig() {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const currentToken = process.env.VITE_MAPBOX_ACCESS_TOKEN;
  const hasValidToken = currentToken && !currentToken.includes('example') && currentToken.length > 20;

  const validateToken = async (testToken: string) => {
    if (!testToken.trim()) {
      return { valid: false, error: 'Token is required' };
    }

    if (!testToken.startsWith('pk.')) {
      return { valid: false, error: 'Invalid token format. Mapbox tokens start with "pk."' };
    }

    try {
      setIsValidating(true);
      
      // Test the token by making a request to Mapbox API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/london.json?access_token=${testToken}&limit=1`
      );
      
      if (response.ok) {
        return { valid: true };
      } else {
        return { valid: false, error: 'Invalid token or insufficient permissions' };
      }
    } catch (error) {
      return { valid: false, error: 'Failed to validate token' };
    } finally {
      setIsValidating(false);
    }
  };

  const handleTokenTest = async () => {
    const result = await validateToken(token);
    
    if (result.valid) {
      toast({
        title: 'Valid Token',
        description: 'Mapbox token is valid and ready to use!',
      });
    } else {
      toast({
        title: 'Invalid Token',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Text copied to clipboard',
    });
  };

  const generateEnvExample = () => {
    const envContent = `# Add this to your .env file or set via DevServerControl tool
VITE_MAPBOX_ACCESS_TOKEN=${token || 'your_mapbox_token_here'}`;
    copyToClipboard(envContent);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Map className="h-6 w-6" />
          <div>
            <CardTitle>Mapbox Configuration</CardTitle>
            <CardDescription>
              Configure Mapbox access token for interactive maps
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Status */}
        <div>
          <h3 className="text-sm font-medium mb-3">Current Status</h3>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {hasValidToken ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium">
                  {hasValidToken ? 'Mapbox Configured' : 'Mapbox Not Configured'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {hasValidToken 
                    ? 'Interactive maps are available'
                    : 'Using fallback map view'
                  }
                </p>
              </div>
            </div>
            {hasValidToken && (
              <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                Active
              </div>
            )}
          </div>
        </div>

        {/* Token Configuration */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="mapbox-token" className="text-sm font-medium">
              Mapbox Access Token
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Enter your Mapbox public access token (starts with "pk.")
            </p>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="mapbox-token"
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="pk.eyJ1IjoieW91ciIsImEiOiJjbGV4YW1wbGUifQ.example"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              <Button
                onClick={handleTokenTest}
                disabled={!token.trim() || isValidating}
                variant="outline"
              >
                {isValidating ? 'Testing...' : 'Test'}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={generateEnvExample}
              disabled={!token.trim()}
              variant="outline"
              size="sm"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy .env Example
            </Button>
            
            <Button
              onClick={() => window.open('https://account.mapbox.com/access-tokens/', '_blank')}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Get Token
            </Button>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Setup Instructions</h3>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 text-sm flex items-center justify-center font-medium">1</span>
                <span className="font-medium">Get Mapbox Access Token</span>
              </div>
              <ul className="space-y-2 text-sm ml-8 text-muted-foreground">
                <li>• Visit <Button variant="link" className="p-0 h-auto text-sm" onClick={() => window.open('https://account.mapbox.com/', '_blank')}>mapbox.com</Button> and create a free account</li>
                <li>• Go to your account dashboard</li>
                <li>• Copy your "Default public token" (starts with pk.)</li>
                <li>• Free tier includes 50,000 map loads per month</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 text-sm flex items-center justify-center font-medium">2</span>
                <span className="font-medium">Configure Environment</span>
              </div>
              <ul className="space-y-2 text-sm ml-8 text-muted-foreground">
                <li>• Paste your token in the field above</li>
                <li>• Click "Test" to validate the token</li>
                <li>• Use DevServerControl tool to set VITE_MAPBOX_ACCESS_TOKEN</li>
                <li>• Or add to your .env file and restart the server</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 text-sm flex items-center justify-center font-medium">3</span>
                <span className="font-medium">Features Enabled</span>
              </div>
              <ul className="space-y-2 text-sm ml-8 text-muted-foreground">
                <li>• Interactive street maps and satellite imagery</li>
                <li>• Smooth zoom, pan, and rotation controls</li>
                <li>• Activity markers with detailed popups</li>
                <li>• User location tracking and navigation</li>
                <li>• Multiple map styles (streets, satellite, outdoors)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* React Native Note */}
        <Alert>
          <Map className="h-4 w-4" />
          <AlertDescription>
            <div>
              <p className="font-medium mb-2">React Native Compatibility</p>
              <p className="text-sm">
                The map components are designed to work with React Native. For mobile apps, you'll also need to install:
              </p>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li><code>react-native-maps</code> for basic mapping</li>
                <li><code>@react-native-mapbox-gl/maps</code> for advanced features</li>
                <li>Platform-specific setup (Google Maps API for Android, MapKit for iOS)</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Current Token Display */}
        {hasValidToken && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">Current Token</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(currentToken!)}
                className="h-6 text-green-700"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <code className="text-xs text-green-700 break-all">
              {currentToken!.substring(0, 20)}...{currentToken!.substring(currentToken!.length - 10)}
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
