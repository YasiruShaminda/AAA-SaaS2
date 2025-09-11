
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Download, RefreshCw, Trash2, Upload, PlusCircle, MoreHorizontal, Pencil, Search, SlidersHorizontal, CheckCircle, Bell, KeyRound, Server, History, Building2, Users } from "lucide-react";
import { useOrganization } from '@/contexts/OrganizationContext';
import type { Organization } from '@/contexts/OrganizationContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";


const apiKeys = [
    { key: 'sk_live_...aBcD', created: '2024-07-01', lastUsed: '2024-07-22', usage: 1423 },
    { key: 'sk_live_...eFgH', created: '2024-06-15', lastUsed: '2024-07-20', usage: 876 },
];

const auditTrail = [
    { user: 'admin', action: 'Generated new API key', ip: '192.168.1.100', timestamp: '2024-07-22 10:30' },
    { user: 'admin', action: 'Enabled Two-Factor Authentication', ip: '192.168.1.100', timestamp: '2024-07-22 10:25' },
    { user: 'admin', action: 'Updated RADIUS server IP', ip: '192.168.1.100', timestamp: '2024-07-21 14:00' },
];

const teamUsers = [
    { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', orgAccess: 2 },
    { id: 'user-2', name: 'Bob Williams', email: 'bob@example.com', role: 'Member', orgAccess: 1 },
    { id: 'user-3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Member', orgAccess: 1 },
];


const OrganizationRow = ({ org, onSelect, onAfterDelete }: { org: Organization, onSelect: (org: Organization) => void, onAfterDelete: () => void }) => {
    const { selectedOrganization, deleteOrganization } = useOrganization();
    
    const getStatusBadgeClass = (status: Organization['status']) => {
        switch (status) {
            case 'Active':
                return 'bg-green-600/20 text-green-300 border-green-500/30';
            case 'Inactive':
                return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30';
            case 'Trial':
                return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
            default:
                return '';
        }
    };

    const handleDelete = async () => {
        await deleteOrganization(org.id);
        onAfterDelete();
    }

    return (
        <TableRow className="hover:bg-muted/50 cursor-pointer" onClick={() => onSelect(org)}>
            <TableCell className="w-12">
                 {selectedOrganization?.id === org.id && <CheckCircle className="size-5 text-primary" />}
            </TableCell>
            <TableCell className="font-medium">{org.name}</TableCell>
            <TableCell>{org.subscribers.toLocaleString()}</TableCell>
            <TableCell>
                <Badge variant={org.status === 'Active' ? 'default' : 'secondary'} className={getStatusBadgeClass(org.status)}>
                    {org.status}
                </Badge>
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreHorizontal /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem><Pencil className="mr-2 size-4" /> Edit</DropdownMenuItem>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    <Trash2 className="mr-2 size-4" /> Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the <strong>{org.name}</strong> organization and all its data.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
};

export default function SettingsPage() {
    const [sharedSecret, setSharedSecret] = useState("a8b2c1d4e6f3g7h9i1j3k2l5m8n");
    const { organizations, selectOrganization, addOrganization } = useOrganization();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newOrgName, setNewOrgName] = useState('');
    const [newOrgDesc, setNewOrgDesc] = useState('');
    const router = useRouter();
    const { toast } = useToast();

    const generateSecret = () => {
        setSharedSecret(Math.random().toString(36).substring(2));
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Maybe show a toast notification here
    }

    const handleAddNewOrg = () => {
        if (!newOrgName.trim()) {
            toast({
                variant: "destructive",
                title: "Organization name required",
                description: "Please enter a name for the organization.",
            });
            return;
        }

        if (organizations.some(org => org.name.toLowerCase() === newOrgName.trim().toLowerCase())) {
            toast({
                variant: "destructive",
                title: "Organization name exists",
                description: "An organization with this name already exists. Please choose a different name.",
            });
            return;
        }

        const newOrg: Organization = {
            id: `org-${Date.now()}`,
            name: newOrgName.trim(),
            description: newOrgDesc,
            type: 'Client',
            subscribers: 0,
            status: 'Trial',
        };
        addOrganization(newOrg);
        setNewOrgName('');
        setNewOrgDesc('');
        setIsAddModalOpen(false);
    }
    
    const checkEmptyOrgs = () => {
        if (organizations.length === 0) {
            router.push('/organizations/new');
        }
    }

  return (
    <div className="flex flex-col gap-8 items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tighter font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account and platform settings.</p>
      </div>

       <Accordion type="single" collapsible className="w-full max-w-4xl space-y-4">
        
        <AccordionItem value="general">
            <AccordionTrigger className="text-xl font-semibold p-4 bg-card/60 backdrop-blur-lg border border-white/10 rounded-lg">
                <div className="flex items-center gap-4">
                    <SlidersHorizontal className="size-6 text-primary" />
                    General
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-0 mt-2">
                 <Card className="glass-card border-t-0 rounded-t-none">
                    <CardHeader>
                    <CardDescription>Update your general platform settings here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 max-w-lg">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                <Input id="sessionTimeout" defaultValue="30" type="number" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateFormat">Date Format</Label>
                                <Input id="dateFormat" defaultValue="MM/DD/YYYY" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Security</h3>
                             <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                                <div>
                                    <Label htmlFor="2fa">Two-Factor Authentication</Label>
                                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                                </div>
                                <Switch id="2fa" />
                            </div>
                        </div>

                         <div>
                            <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                            <div className="space-y-4">
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
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-4 pt-6">
                        <h3 className="text-lg font-semibold">Backup & Restore</h3>
                        <p className="text-sm text-muted-foreground">Backup your settings or restore from a previous state.</p>
                        <div className="flex gap-2">
                            <Button variant="outline"><Download className="mr-2"/> Backup Settings</Button>
                            <Button variant="outline"><Upload className="mr-2"/> Restore Settings</Button>
                        </div>
                    </CardFooter>
                </Card>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="orgs">
            <AccordionTrigger className="text-xl font-semibold p-4 bg-card/60 backdrop-blur-lg border border-white/10 rounded-lg">
                <div className="flex items-center gap-4">
                    <Building2 className="size-6 text-primary" />
                    Organization Management
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-0 mt-2">
                <Card className="glass-card border-t-0 rounded-t-none">
                    <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <CardDescription>Select an organization to manage or create a new one.</CardDescription>
                        </div>
                        <div className="flex w-full md:w-auto gap-2">
                            <div className="relative flex-1 md:flex-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                            <Input placeholder="Search organizations..." className="pl-10"/>
                            </div>
                            <Button onClick={() => setIsAddModalOpen(true)}><PlusCircle className="mr-2" /> Add Organization</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">Active</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Subscribers</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {organizations.map(org => (
                                    <OrganizationRow key={org.id} org={org} onSelect={selectOrganization} onAfterDelete={checkEmptyOrgs} />
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center pt-6">
                        <p className="text-sm text-muted-foreground">
                            Showing {organizations.length} organizations.
                        </p>
                    </CardFooter>
                </Card>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="users">
            <AccordionTrigger className="text-xl font-semibold p-4 bg-card/60 backdrop-blur-lg border border-white/10 rounded-lg">
                <div className="flex items-center gap-4">
                    <Users className="size-6 text-primary" />
                    User Management
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-0 mt-2">
                <Card className="glass-card border-t-0 rounded-t-none">
                     <CardHeader className="flex flex-row items-center justify-between">
                        <CardDescription>Manage team members, roles, and organization access.</CardDescription>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button><PlusCircle className="mr-2" /> Add User</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New User</DialogTitle>
                                    <DialogDescription>Enter the details for the new team member.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="invite-email">Email Address</Label>
                                        <Input id="invite-email" type="email" placeholder="name@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="invite-role">Role</Label>
                                        <Select>
                                            <SelectTrigger id="invite-role">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="member">Member</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="secondary">Save</Button>
                                    <Button>Save &amp; Send Invitation</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Organizations</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teamUsers.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                                        </TableCell>
                                        <TableCell>{user.orgAccess}</TableCell>
                                        <TableCell className="text-right">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm">Manage</Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle>Manage User: {user.name}</DialogTitle>
                                                        <DialogDescription>Modify roles and organization access.</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="py-4 space-y-6">
                                                        <div className="space-y-2">
                                                            <Label>Role</Label>
                                                             <Select defaultValue={user.role.toLowerCase()}>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="admin">Admin</SelectItem>
                                                                    <SelectItem value="member">Member</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Organization Access</Label>
                                                            <Card className="max-h-64 overflow-y-auto">
                                                                <CardContent className="p-4 space-y-4">
                                                                    {organizations.map(org => (
                                                                        <div key={org.id} className="flex items-center gap-3">
                                                                            <Checkbox id={`org-access-${user.id}-${org.id}`} defaultChecked={user.orgAccess > 0 && (org.id === 'org-1' || org.id === 'org-2')} />
                                                                            <div className="flex flex-col">
                                                                                <Label htmlFor={`org-access-${user.id}-${org.id}`} className="font-medium">{org.name}</Label>
                                                                                <span className="text-xs text-muted-foreground">{org.description}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </CardContent>
                                                            </Card>
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button variant="destructive-outline">Remove User</Button>
                                                        <Button>Save Changes</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="api">
             <AccordionTrigger className="text-xl font-semibold p-4 bg-card/60 backdrop-blur-lg border border-white/10 rounded-lg">
                 <div className="flex items-center gap-4">
                    <KeyRound className="size-6 text-primary" />
                    API
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-0 mt-2">
                <Card className="glass-card border-t-0 rounded-t-none">
                    <CardHeader>
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
                                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(key.key)}><Copy className="size-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="size-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="controller">
             <AccordionTrigger className="text-xl font-semibold p-4 bg-card/60 backdrop-blur-lg border border-white/10 rounded-lg">
                 <div className="flex items-center gap-4">
                    <Server className="size-6 text-primary" />
                    Controller Setup
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-0 mt-2">
                <Card className="glass-card border-t-0 rounded-t-none">
                    <CardHeader>
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
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="audit">
             <AccordionTrigger className="text-xl font-semibold p-4 bg-card/60 backdrop-blur-lg border border-white/10 rounded-lg">
                 <div className="flex items-center gap-4">
                    <History className="size-6 text-primary" />
                    Audit Trail
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-0 mt-2">
                <Card className="glass-card border-t-0 rounded-t-none">
                    <CardHeader>
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
            </AccordionContent>
        </AccordionItem>

      </Accordion>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Organization</DialogTitle>
                <DialogDescription>Enter the details for your new organization. This will be the container for your subscribers and profiles.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input id="org-name" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder="e.g. FTTX Provider"/>
                </div>
                    <div className="space-y-2">
                    <Label htmlFor="org-desc">Description (Optional)</Label>
                    <Input id="org-desc" value={newOrgDesc} onChange={(e) => setNewOrgDesc(e.target.value)} placeholder="e.g. Main corporate client"/>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAddNewOrg}>Create Organization</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </div>
  );
}
