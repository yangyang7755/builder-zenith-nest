import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Database, Server, Shield, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { DatabaseConfig } from '../components/DatabaseConfig';
import { MapboxConfig } from '../components/MapboxConfig';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function DatabaseManagement() {
  const [activeTab, setActiveTab] = useState('connection');

  return (
    <div className="min-h-screen bg-white font-cabin max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <Link to="/admin">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <span className="text-gray-500 font-medium">Database Management</span>
        <div className="w-6"></div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black mb-2">Database Management</h1>
          <p className="text-gray-600">
            Configure and manage your database connection, schema, and data.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="connection" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Connection
            </TabsTrigger>
            <TabsTrigger value="maps" className="flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 2L7 8L2 9L7 10L9 16L11 10L16 9L11 8L9 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 9V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Maps
            </TabsTrigger>
            <TabsTrigger value="schema" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Schema
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Docs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-6">
            <DatabaseConfig />
          </TabsContent>

          <TabsContent value="maps" className="space-y-6">
            <MapboxConfig />
          </TabsContent>

          <TabsContent value="schema" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Schema</CardTitle>
                <CardDescription>
                  View and manage your database tables and relationships
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Core Tables</h3>
                      <Badge variant="secondary">5 tables</Badge>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center justify-between">
                        <span>profiles</span>
                        <Badge variant="outline">Users</Badge>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>clubs</span>
                        <Badge variant="outline">Sports clubs</Badge>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>activities</span>
                        <Badge variant="outline">Events</Badge>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>club_memberships</span>
                        <Badge variant="outline">Memberships</Badge>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>activity_participants</span>
                        <Badge variant="outline">Participants</Badge>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Chat System</h3>
                      <Badge variant="secondary">2 tables</Badge>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center justify-between">
                        <span>chat_messages</span>
                        <Badge variant="outline">Club chat</Badge>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>direct_messages</span>
                        <Badge variant="outline">Private chat</Badge>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Storage</h3>
                      <Badge variant="secondary">3 buckets</Badge>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center justify-between">
                        <span>profile-images</span>
                        <Badge variant="outline">User photos</Badge>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>club-images</span>
                        <Badge variant="outline">Club photos</Badge>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>activity-images</span>
                        <Badge variant="outline">Activity photos</Badge>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Additional Features</h3>
                      <Badge variant="secondary">3 tables</Badge>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center justify-between">
                        <span>reviews</span>
                        <Badge variant="outline">User reviews</Badge>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>followers</span>
                        <Badge variant="outline">User follows</Badge>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>activity_images</span>
                        <Badge variant="outline">Media gallery</Badge>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="w-full">
                      View Schema SQL
                    </Button>
                    <Button variant="outline" className="w-full">
                      Export Schema
                    </Button>
                    <Button variant="outline" className="w-full">
                      Backup Database
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
                <CardDescription>
                  Manage database security, permissions, and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Row Level Security</h3>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Enabled</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Users can only access their own data and public information.
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li>✅ Profile access controls</li>
                      <li>✅ Club manager permissions</li>
                      <li>✅ Activity organizer rights</li>
                      <li>✅ Storage bucket policies</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Authentication</h3>
                      <Badge className="bg-green-100 text-green-800 border-green-200">JWT Based</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Secure authentication with automatic token refresh.
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li>✅ Email/password login</li>
                      <li>✅ Session management</li>
                      <li>✅ Automatic profile creation</li>
                      <li>🔄 Social auth (future)</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">API Security</h3>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Protected</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      All API endpoints are protected with authentication.
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li>✅ Bearer token validation</li>
                      <li>✅ Input sanitization</li>
                      <li>✅ Rate limiting ready</li>
                      <li>✅ CORS configuration</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">File Upload Security</h3>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Secured</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      File uploads are validated and access-controlled.
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li>✅ File type validation</li>
                      <li>✅ Size limits (10MB)</li>
                      <li>✅ User permission checks</li>
                      <li>✅ Automatic compression</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Documentation</CardTitle>
                <CardDescription>
                  Setup guides, SQL scripts, and troubleshooting resources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Setup Scripts</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <Button variant="link" className="p-0 h-auto">
                          database/schema.sql
                        </Button>
                        <p className="text-gray-600">Core table definitions</p>
                      </li>
                      <li>
                        <Button variant="link" className="p-0 h-auto">
                          database/rls_policies.sql
                        </Button>
                        <p className="text-gray-600">Security policies</p>
                      </li>
                      <li>
                        <Button variant="link" className="p-0 h-auto">
                          database/add_chat_system.sql
                        </Button>
                        <p className="text-gray-600">Chat functionality</p>
                      </li>
                      <li>
                        <Button variant="link" className="p-0 h-auto">
                          database/add_storage.sql
                        </Button>
                        <p className="text-gray-600">File storage setup</p>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Documentation</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <Button variant="link" className="p-0 h-auto">
                          DATABASE_SETUP.md
                        </Button>
                        <p className="text-gray-600">Initial setup guide</p>
                      </li>
                      <li>
                        <Button variant="link" className="p-0 h-auto">
                          BACKEND_SETUP.md
                        </Button>
                        <p className="text-gray-600">Backend configuration</p>
                      </li>
                      <li>
                        <Button variant="link" className="p-0 h-auto">
                          API_DOCUMENTATION.md
                        </Button>
                        <p className="text-gray-600">API reference</p>
                      </li>
                      <li>
                        <Button variant="link" className="p-0 h-auto">
                          CHAT_SYSTEM.md
                        </Button>
                        <p className="text-gray-600">Real-time chat docs</p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-3">Quick Setup Commands</h3>
                  <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm space-y-2">
                    <div>
                      <span className="text-gray-500"># 1. Create Supabase project</span>
                      <br />
                      <span>Visit supabase.com and create new project</span>
                    </div>
                    <div>
                      <span className="text-gray-500"># 2. Set environment variables</span>
                      <br />
                      <span>Use DevServerControl tool to set SUPABASE_URL and keys</span>
                    </div>
                    <div>
                      <span className="text-gray-500"># 3. Run database scripts</span>
                      <br />
                      <span>Execute SQL files in Supabase SQL Editor</span>
                    </div>
                    <div>
                      <span className="text-gray-500"># 4. Test connection</span>
                      <br />
                      <span>Use "Test Connection" button above</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
