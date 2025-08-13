
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Download, RefreshCw, Trash2, Upload } from "lucide-react";

const apiKeys = [
    { key: 'sk_live_...aBcD', created: '2024-07-01', lastUsed: '2024-07-22', usage: 1423 },
    { key: 'sk_live_...eFgH', created: '2024-06-15', lastUsed: '2024-07-20', usage: 876 },
];

const auditTrail = [
    { user: 'admin', action: 'Generated new API key', ip: '192.168.1.100', timestamp: '2024-07-22 10:30' },
    { user: 'admin', action: 'Enabled Two-Factor Authentication', ip: '192.168.1.100', timestamp: '2024-07-22 10:25' },
    { user: 'admin', action: 'Updated RADIUS server IP', ip: '192.168.1.100', timestamp: '2024-07-21 14:00' },
];

const userRoles = [
    { id: 'usr_1', email: 'admin@aaasaas.com', role: 'Admin' },
    { id: 'usr_2', email: 'viewer@aaasaas.com', role: 'Viewer' },
    { id: 'usr_3', email: 'editor@aaasaas.com', role: 'Editor' },
];

export default function SettingsPage() {
    const [sharedSecret, setSharedSecret] = useState("a8b2c1d4e6f3g7h9i1j3k2l5m8n");
    
    const generateSecret = () => {
        setSharedSecret(Math.random().toString(36).substring(2));
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Maybe show a toast notification here
    }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tighter font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account and platform settings.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 max-w-3xl">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="controller">Controller Setup</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Update your general platform settings here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input id="sessionTimeout" defaultValue="30" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Input id="dateFormat" defaultValue="MM/DD/YYYY" />
              </div>
            </CardContent>
             <CardFooter className="flex flex-col items-start gap-4">
                 <h3 className="text-lg font-semibold">Backup & Restore</h3>
                 <p className="text-sm text-muted-foreground">Backup your settings or restore from a previous state.</p>
                <div className="flex gap-2">
                    <Button variant="outline"><Download className="mr-2"/> Backup Settings</Button>
                    <Button variant="outline"><Upload className="mr-2"/> Restore Settings</Button>
                </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your security preferences and user access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-lg">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                <div>
                    <Label htmlFor="2fa">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                </div>
                <Switch id="2fa" />
              </div>

              <div>
                <h3 className="text-lg font-semibold">Role-Based Access Control</h3>
                <p className="text-sm text-muted-foreground mb-4">Manage roles for team members.</p>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userRoles.map(user => (
                             <TableRow key={user.id}>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Select defaultValue={user.role}>
                                        <SelectTrigger className="w-32 h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Admin">Admin</SelectItem>
                                            <SelectItem value="Editor">Editor</SelectItem>
                                            <SelectItem value="Viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                                </TableCell>
                             </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-lg">
               <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                 <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive emails about critical events and updates.</p>
                 </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                 <div>
                    <Label htmlFor="system-alerts">System Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified about client disconnections or system errors.</p>
                 </div>
                <Switch id="system-alerts" defaultChecked />
              </div>
            </CardContent>
             <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>API Management</CardTitle>
                    <CardDescription>Generate and manage API keys for integrations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-4">
                        <Button>Generate New API Key</Button>
                        <Button variant="link">View API Guide</Button>
                    </div>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Key</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Last Used</TableHead>
                                <TableHead>Usage (24h)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {apiKeys.map(key => (
                                <TableRow key={key.key}>
                                    <TableCell className="font-mono">{key.key}</TableCell>
                                    <TableCell>{key.created}</TableCell>
                                    <TableCell>{key.lastUsed}</TableCell>
                                    <TableCell>{key.usage}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon"><Copy className="size-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="size-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="controller">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Controller Setup</CardTitle>
                    <CardDescription>Use these details to configure your network controller for RADIUS authentication.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 max-w-2xl">
                    <div className="space-y-2">
                        <Label>RADIUS Server IPs</Label>
                        <div className="flex items-center gap-2">
                            <Input readOnly value="198.51.100.1" className="font-mono"/>
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard('198.51.100.1')}><Copy/></Button>
                            <Badge variant="outline" className="border-green-500/50 text-green-400">Primary</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input readOnly value="198.51.100.2" className="font-mono"/>
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard('198.51.100.2')}><Copy/></Button>
                            <Badge variant="outline">Secondary</Badge>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Authentication Port</Label>
                            <Input readOnly value="1812" />
                        </div>
                         <div className="space-y-2">
                            <Label>Accounting Port</Label>
                            <Input readOnly value="1813" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Shared Secret</Label>
                         <div className="flex items-center gap-2">
                            <Input type="password" readOnly value={sharedSecret} className="font-mono"/>
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(sharedSecret)}><Copy/></Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" onClick={generateSecret}>
                        <RefreshCw className="mr-2" />
                        Regenerate Secret
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>

        <TabsContent value="audit">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Audit Trail</CardTitle>
                    <CardDescription>Review important actions and changes on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead className="text-right">Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {auditTrail.map((log, index) => (
                                <TableRow key={index}>
                                    <TableCell>{log.user}</TableCell>
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell className="font-mono">{log.ip}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">{log.timestamp}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
