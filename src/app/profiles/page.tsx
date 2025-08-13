
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Copy, FileText, Wifi, Building, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';


type Profile = {
    id: string;
    name: string;
    description: string;
    workflow: string;
    isTemplate?: boolean;
    authEnabled: boolean;
    acctEnabled: boolean;
    checkAttributes: string[];
    replyAttributes: string[];
    vendorAttributes: string[];
    accountingAttributes: string[];
};

const initialProfiles: Profile[] = [
    {
        id: 'tpl-wifi-hotspot',
        name: 'Wi-Fi Hotspot (Auth-Only)',
        description: 'Simple authentication for public Wi-Fi. No accounting.',
        workflow: 'Guest-Wifi',
        isTemplate: true,
        authEnabled: true,
        acctEnabled: false,
        checkAttributes: ['User-Name', 'User-Password'],
        replyAttributes: ['Session-Timeout', 'Idle-Timeout'],
        vendorAttributes: [],
        accountingAttributes: [],
    },
    {
        id: 'tpl-enterprise-aaa',
        name: 'Enterprise AAA',
        description: 'Full AAA profile for corporate networks with accounting.',
        workflow: 'Default',
        isTemplate: true,
        authEnabled: true,
        acctEnabled: true,
        checkAttributes: ['User-Name', 'User-Password'],
        replyAttributes: ['Framed-IP-Address', 'Class'],
        vendorAttributes: ['Cisco-AVPair'],
        accountingAttributes: ['Acct-Status-Type', 'Acct-Session-Id', 'Acct-Input-Octets', 'Acct-Output-Octets'],
    }
];

const workflows = ['Default', 'Guest-Wifi', 'VPN-Users'];

const allRadiusAttributes = [
    'User-Name', 'User-Password', 'CHAP-Password', 'NAS-IP-Address', 'NAS-Port', 
    'Service-Type', 'Framed-Protocol', 'Framed-IP-Address', 'Framed-IP-Netmask',
    'Framed-Routing', 'Filter-Id', 'Framed-MTU', 'Framed-Compression', 'Login-IP-Host',
    'Login-Service', 'Login-TCP-Port', 'Reply-Message', 'Callback-Number', 'Callback-Id',
    'Framed-Route', 'Framed-Pool', 'Class', 'Session-Timeout', 'Idle-Timeout', 
    'Termination-Action', 'Called-Station-Id', 'Calling-Station-Id', 'NAS-Identifier',
    'Proxy-State', 'Acct-Status-Type', 'Acct-Delay-Time', 'Acct-Input-Octets',
    'Acct-Output-Octets', 'Acct-Session-Id', 'Acct-Authentic', 'Acct-Session-Time',
    'Acct-Input-Packets', 'Acct-Output-Packets', 'Acct-Terminate-Cause', 'Acct-Multi-Session-Id',
    'Acct-Link-Count', 'Cisco-AVPair', 'Ruckus-Wlan-ID', 'Actiontec-VLAN-ID'
];

type AttributeType = 'checkAttributes' | 'replyAttributes' | 'vendorAttributes' | 'accountingAttributes';


export default function ProfilesPage() {
    const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
    const [selectedProfile, setSelectedProfile] = useState<Profile>(initialProfiles[0]);

    const handleSelectProfile = (profileId: string) => {
        const profile = profiles.find(p => p.id === profileId);
        if (profile) {
            setSelectedProfile(profile);
        }
    };

    const duplicateProfile = () => {
        const newId = `custom-${Date.now()}`;
        const newProfile: Profile = {
            ...selectedProfile,
            id: newId,
            name: `${selectedProfile.name} (Copy)`,
            isTemplate: false,
        };
        setProfiles(prev => [...prev, newProfile]);
        setSelectedProfile(newProfile);
    };

    const addNewProfile = () => {
        const newId = `custom-${Date.now()}`;
        const newProfile: Profile = {
            id: newId,
            name: 'New Custom Profile',
            description: 'A new empty profile.',
            workflow: 'Default',
            isTemplate: false,
            authEnabled: true,
            acctEnabled: false,
            checkAttributes: [],
            replyAttributes: [],
            vendorAttributes: [],
            accountingAttributes: [],
        };
        setProfiles(prev => [...prev, newProfile]);
        setSelectedProfile(newProfile);
    };

    const deleteProfile = (profileId: string) => {
        setProfiles(prev => {
            const newProfiles = prev.filter(p => p.id !== profileId);
            if (selectedProfile.id === profileId) {
                setSelectedProfile(newProfiles.length > 0 ? newProfiles[0] : initialProfiles[0]);
            }
            return newProfiles;
        });
    };

    const updateSelectedProfile = (field: keyof Profile, value: any) => {
        if (selectedProfile.isTemplate) return;
        setSelectedProfile(prev => ({...prev, [field]: value}));
    };
    
    const handleAttributeToggle = (type: AttributeType, attribute: string) => {
        if (selectedProfile.isTemplate) return;
        const currentAttributes = selectedProfile[type];
        const newAttributes = currentAttributes.includes(attribute)
            ? currentAttributes.filter(a => a !== attribute)
            : [...currentAttributes, attribute];
        updateSelectedProfile(type, newAttributes);
    };

    const removeAttribute = (type: AttributeType, attribute: string) => {
        if (selectedProfile.isTemplate) return;
        updateSelectedProfile(type, selectedProfile[type].filter(a => a !== attribute));
    };

    const saveProfile = () => {
        if(selectedProfile.isTemplate) return;
        setProfiles(prev => prev.map(p => p.id === selectedProfile.id ? selectedProfile : p));
        alert(`Profile "${selectedProfile.name}" saved!`);
    }

    return (
        <div className="grid h-full min-h-[calc(100vh-8rem)] grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
            <aside>
                <Card className="glass-card sticky top-24">
                    <CardHeader>
                        <CardTitle>Profiles</CardTitle>
                        <CardDescription>Manage and create new profiles.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                        <ScrollArea className="h-[60vh]">
                            <div className="p-2 space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-semibold text-muted-foreground">My Profiles</h3>
                                        <Button variant="ghost" size="sm" onClick={addNewProfile}>
                                            <PlusCircle className="mr-2" /> Add
                                        </Button>
                                    </div>
                                    <div className="space-y-1">
                                         {profiles.filter(p => !p.isTemplate).map(profile => (
                                            <div key={profile.id} className="flex items-center group">
                                                <Button
                                                    variant={selectedProfile.id === profile.id ? 'secondary' : 'ghost'}
                                                    className="w-full justify-start"
                                                    onClick={() => handleSelectProfile(profile.id)}
                                                >
                                                    <FileText className="mr-2" />
                                                    <span className="flex-1 truncate">{profile.name}</span>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-8 shrink-0 opacity-0 group-hover:opacity-100">
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the profile "{profile.name}".
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteProfile(profile.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                                 <div>
                                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Profile Templates</h3>
                                    <div className="space-y-1">
                                        {profiles.filter(p => p.isTemplate).map(profile => (
                                            <Button
                                                key={profile.id}
                                                variant={selectedProfile.id === profile.id ? 'secondary' : 'ghost'}
                                                className="w-full justify-start"
                                                onClick={() => handleSelectProfile(profile.id)}
                                            >
                                                {profile.name.includes('Wi-Fi') ? <Wifi className="mr-2" /> : <Building className="mr-2" />}
                                                {profile.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </aside>
            <main>
                <Card className="glass-card min-h-[calc(100vh-10rem)]">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="font-headline text-2xl">{selectedProfile.name}</CardTitle>
                                <CardDescription>{selectedProfile.description}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {selectedProfile.isTemplate && <Button onClick={duplicateProfile}><Copy className="mr-2" /> Duplicate & Edit</Button>}
                                {!selectedProfile.isTemplate && (
                                    <>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive-outline"><Trash2 className="mr-2"/> Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the profile "{selectedProfile.name}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteProfile(selectedProfile.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        <Button onClick={saveProfile}>Save Profile</Button>
                                    </>
                                )}
                            </div>
                        </div>
                        {selectedProfile.isTemplate && <p className="text-sm text-yellow-400 mt-2">This is a read-only template. Duplicate to make changes.</p>}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Core Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="profile-name">Profile Name</Label>
                                    <Input id="profile-name" value={selectedProfile.name} onChange={(e) => updateSelectedProfile('name', e.target.value)} disabled={selectedProfile.isTemplate} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="workflow">Workflow</Label>
                                    <Select 
                                        value={selectedProfile.workflow} 
                                        onValueChange={(value) => updateSelectedProfile('workflow', value)}
                                        disabled={selectedProfile.isTemplate}
                                    >
                                        <SelectTrigger id="workflow">
                                            <SelectValue placeholder="Select a workflow" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {workflows.map(wf => <SelectItem key={wf} value={wf}>{wf}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2 pt-6">
                                    <Switch id="auth-enabled" checked={selectedProfile.authEnabled} onCheckedChange={(c) => updateSelectedProfile('authEnabled', c)} disabled={selectedProfile.isTemplate} />
                                    <Label htmlFor="auth-enabled">Authentication</Label>
                                </div>
                                <div className="flex items-center space-x-2 pt-6">
                                    <Switch id="acct-enabled" checked={selectedProfile.acctEnabled} onCheckedChange={(c) => updateSelectedProfile('acctEnabled', c)} disabled={selectedProfile.isTemplate} />
                                    <Label htmlFor="acct-enabled">Accounting</Label>
                                </div>
                            </CardContent>
                        </Card>
                         <Tabs defaultValue="check">
                            <TabsList>
                                <TabsTrigger value="check" disabled={!selectedProfile.authEnabled && !selectedProfile.isTemplate}>Check Attributes</TabsTrigger>
                                <TabsTrigger value="reply" disabled={!selectedProfile.authEnabled && !selectedProfile.isTemplate}>Reply Attributes</TabsTrigger>
                                <TabsTrigger value="accounting" disabled={!selectedProfile.acctEnabled && !selectedProfile.isTemplate}>Accounting Attributes</TabsTrigger>
                                <TabsTrigger value="vendor">Vendor-Specific</TabsTrigger>
                            </TabsList>
                            <TabsContent value="check">
                                <AttributeEditor 
                                    attributes={selectedProfile.checkAttributes} 
                                    type="checkAttributes"
                                    onToggle={handleAttributeToggle}
                                    onRemove={removeAttribute}
                                    isTemplate={selectedProfile.isTemplate}
                                    isDisabled={!selectedProfile.authEnabled}
                                />
                            </TabsContent>
                            <TabsContent value="reply">
                                <AttributeEditor 
                                    attributes={selectedProfile.replyAttributes}
                                    type="replyAttributes"
                                    onToggle={handleAttributeToggle}
                                    onRemove={removeAttribute}
                                    isTemplate={selectedProfile.isTemplate}
                                    isDisabled={!selectedProfile.authEnabled}
                                />
                            </TabsContent>
                             <TabsContent value="vendor">
                                <AttributeEditor 
                                    attributes={selectedProfile.vendorAttributes}
                                    type="vendorAttributes"
                                    onToggle={handleAttributeToggle}
                                    onRemove={removeAttribute}
                                    isTemplate={selectedProfile.isTemplate}
                                />
                            </TabsContent>
                             <TabsContent value="accounting">
                                <AttributeEditor 
                                    attributes={selectedProfile.accountingAttributes}
                                    type="accountingAttributes"
                                    onToggle={handleAttributeToggle}
                                    onRemove={removeAttribute}
                                    isTemplate={selectedProfile.isTemplate}
                                    isDisabled={!selectedProfile.acctEnabled}
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

function AttributeEditor({ attributes, type, onToggle, onRemove, isTemplate, isDisabled }: { attributes: string[], type: AttributeType, onToggle: (type: AttributeType, attr: string) => void, onRemove: (type: AttributeType, attr: string) => void, isTemplate?: boolean, isDisabled?: boolean }) {
    const finalDisabled = isTemplate || isDisabled;

    return (
        <Card className={finalDisabled ? 'bg-muted/30' : ''}>
            <CardContent className="pt-6">
                <div className="flex justify-end mb-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={finalDisabled}>
                                <PlusCircle className="mr-2" /> Add Attributes
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64" align="end">
                            <DropdownMenuLabel>Select RADIUS Attributes</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <ScrollArea className="h-72">
                                {allRadiusAttributes.map(attr => (
                                    <DropdownMenuCheckboxItem
                                        key={attr}
                                        checked={attributes.includes(attr)}
                                        onSelect={(e) => e.preventDefault()}
                                        onCheckedChange={() => onToggle(type, attr)}
                                    >
                                        {attr}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </ScrollArea>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="min-h-[100px] rounded-md border p-4 space-y-2 space-x-2">
                    {attributes.length > 0 ? attributes.map(attr => (
                         <Badge key={attr} variant="secondary" className="text-base">
                            {attr}
                            <button onClick={() => onRemove(type, attr)} disabled={finalDisabled} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="size-3" />
                            </button>
                        </Badge>
                    )) : (
                        <p className="text-sm text-muted-foreground">No attributes defined.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

    