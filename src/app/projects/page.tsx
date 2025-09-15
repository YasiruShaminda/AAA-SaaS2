

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Copy, FileText, Wifi, Building, X, MoreHorizontal, RefreshCw, FolderKanban, Search, Eye, EyeOff, ChevronLeft, Pencil, Library, FlaskConical, Terminal, Loader } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { TemplateManagerDialog, type ProfileTemplate } from '@/components/projects/TemplateManager';
import { useOrganization, type Project, type ProjectProfile } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { PreviewAnimation } from '@/components/projects/PreviewAnimation';

// Data types from the old /profiles page
type ProfileAttributeType = 'checkAttributes' | 'replyAttributes' | 'vendorAttributes' | 'accountingAttributes';
export type Profile = ProjectProfile;

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

// Project Editor Component
function ProjectEditor({ project, onUpdate, onSave, onDelete, onDuplicate, onBack, subscriberGroups }: { project: Project, onUpdate: (project: Project) => void, onSave: () => void, onDelete: () => void, onDuplicate: () => void, onBack: () => void, subscriberGroups: string[] }) {
    const router = useRouter();
    const { user } = useAuth();
    const [showSecret, setShowSecret] = useState(false);
    const [editedHeader, setEditedHeader] = useState({ name: project.name, description: project.description });
    const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
    const [isTemplateManagerOpen, setTemplateManagerOpen] = useState(false);
    const [showPreviewHint, setShowPreviewHint] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isCliTestOpen, setIsCliTestOpen] = useState(false);

    // Ensure project has required fields with defaults
    const safeProject: Project = {
        ...project,
        sharedSecret: project.sharedSecret || 'shared-secret-' + Math.random().toString(36).substring(2),
        subscriberGroups: project.subscriberGroups || [],
        profile: project.profile || {
            authEnabled: Boolean(project.auth_enabled),
            acctEnabled: Boolean(project.acct_enabled),
            checkAttributes: [],
            replyAttributes: [],
            vendorAttributes: [],
            accountingAttributes: []
        }
    };


    useEffect(() => {
        if (user) {
            const hintEnabled = localStorage.getItem(`onboarding_show_preview_hint_${user.name}`) === 'true';
            setShowPreviewHint(hintEnabled);
        }
    }, [user]);

    const handleProfileUpdate = (field: keyof Profile, value: any) => {
        const updatedProject = {
            ...safeProject,
            profile: { ...safeProject.profile, [field]: value } as ProjectProfile
        };
        onUpdate(updatedProject);
    };

    const handleAttributeToggle = (type: ProfileAttributeType, attribute: string) => {
        const currentAttributes = safeProject.profile[type];
        const newAttributes = currentAttributes.includes(attribute)
            ? currentAttributes.filter((a: string) => a !== attribute)
            : [...currentAttributes, attribute];
        handleProfileUpdate(type, newAttributes);
    };

    const removeAttribute = (type: ProfileAttributeType, attribute: string) => {
        handleProfileUpdate(type, safeProject.profile[type].filter((a: string) => a !== attribute));
    };
    
    const generateSecret = () => {
        onUpdate({...project, sharedSecret: Math.random().toString(36).substring(2) })
    };

    const handleSaveHeader = () => {
        onUpdate({...project, name: editedHeader.name, description: editedHeader.description });
        setIsEditHeaderOpen(false);
    };

    const handleCancelHeaderEdit = () => {
        setEditedHeader({ name: project.name, description: project.description });
        setIsEditHeaderOpen(false);
    };

    const handleLoadTemplate = (template: ProfileTemplate) => {
        const newProfile: ProjectProfile = {
            authEnabled: safeProject.profile.authEnabled,
            acctEnabled: safeProject.profile.acctEnabled,
            checkAttributes: template.attributes?.checkAttributes ?? safeProject.profile.checkAttributes,
            replyAttributes: template.attributes?.replyAttributes ?? safeProject.profile.replyAttributes,
            vendorAttributes: template.attributes?.vendorAttributes ?? safeProject.profile.vendorAttributes,
            accountingAttributes: template.attributes?.accountingAttributes ?? safeProject.profile.accountingAttributes
        };
        onUpdate({ ...safeProject, profile: newProfile });
        setTemplateManagerOpen(false);
    };
    
    const handlePreviewClick = () => {
        if (user) {
            localStorage.removeItem(`onboarding_show_preview_hint_${user.name}`);
        }
        setShowPreviewHint(false);
        setIsPreviewOpen(true);
    }

    return (
        <div className="space-y-6">
            <Card className="glass-card">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4 flex-1">
                            <Button variant="outline" size="icon" onClick={onBack}>
                                <ChevronLeft className="size-4" />
                            </Button>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold font-headline">{project.name}</h1>
                                <p className="text-muted-foreground mt-1">{project.description}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                             <Dialog open={isEditHeaderOpen} onOpenChange={setIsEditHeaderOpen}>
                                <DialogTrigger asChild>
                                     <Button variant="outline" size="icon"><Pencil className="size-4"/></Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Project Details</DialogTitle>
                                        <DialogDescription>Update the name and description for this project.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-proj-name">Project Name</Label>
                                            <Input 
                                                id="edit-proj-name"
                                                value={editedHeader.name} 
                                                onChange={(e) => setEditedHeader({...editedHeader, name: e.target.value})}
                                                placeholder="Project Name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-proj-desc">Project Description</Label>
                                            <Textarea 
                                                id="edit-proj-desc"
                                                value={editedHeader.description}
                                                onChange={(e) => setEditedHeader({...editedHeader, description: e.target.value})}
                                                placeholder="Project Description"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={handleCancelHeaderEdit}>Cancel</Button>
                                        <Button onClick={handleSaveHeader}>Save</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive-outline"><Trash2 className="mr-2"/> Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the project "{project.name}".
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button onClick={onDuplicate} variant="outline"><Copy className="mr-2" /> Duplicate</Button>
                            <Button onClick={onSave} disabled={!project.name.trim() || !safeProject.sharedSecret.trim() || safeProject.subscriberGroups.length === 0}>Save Project</Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-1 space-y-6">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>AAA Secret</CardTitle>
                            <CardDescription>The shared secret for RADIUS communication.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center gap-2">
                                <Input 
                                    type={showSecret ? 'text' : 'password'} 
                                    value={safeProject.sharedSecret}
                                    onChange={(e) => onUpdate({...project, sharedSecret: e.target.value})}
                                    placeholder="Enter shared secret"
                                    className="font-mono"
                                />
                                <Button variant="ghost" size="icon" onClick={() => setShowSecret(prev => !prev)}>
                                    {showSecret ? <EyeOff /> : <Eye />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={generateSecret}>
                                    <RefreshCw />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Subscriber Groups</CardTitle>
                            <CardDescription>Assign subscriber groups to this project.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start"><PlusCircle className="mr-2"/> Add group...</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {subscriberGroups.filter(g => !safeProject.subscriberGroups.includes(g)).map(group => (
                                        <DropdownMenuItem key={group} onSelect={() => onUpdate({...project, subscriberGroups: [...safeProject.subscriberGroups, group]})}>
                                            {group}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <div className="mt-4 space-y-2">
                                {safeProject.subscriberGroups.map((group: string) => (
                                    <Badge key={group} variant="secondary" className="text-base mr-2">
                                        {group}
                                        <button onClick={() => onUpdate({...safeProject, subscriberGroups: safeProject.subscriberGroups.filter((g: string) => g !== group)})} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                            <X className="size-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                    <Card className="glass-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>RADIUS Profile</CardTitle>
                                    <CardDescription>Configure RADIUS attributes and behavior for this project.</CardDescription>
                                </div>
                                <TemplateManagerDialog open={isTemplateManagerOpen} onOpenChange={setTemplateManagerOpen} onSelectTemplate={handleLoadTemplate}>
                                    <Button variant="outline"><Library className="mr-2"/> Load Template</Button>
                                </TemplateManagerDialog>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Switch id="auth-enabled" checked={safeProject.profile.authEnabled} onCheckedChange={(c) => handleProfileUpdate('authEnabled', c)} />
                                    <Label htmlFor="auth-enabled">Authentication</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="acct-enabled" checked={safeProject.profile.acctEnabled} onCheckedChange={(c) => handleProfileUpdate('acctEnabled', c)} />
                                    <Label htmlFor="acct-enabled">Accounting</Label>
                                </div>
                            </div>
                             <Tabs defaultValue="check">
                                <TabsList>
                                    <TabsTrigger value="check" disabled={!safeProject.profile.authEnabled}>Auth Request</TabsTrigger>
                                    <TabsTrigger value="reply" disabled={!safeProject.profile.authEnabled}>Auth Reply</TabsTrigger>
                                    <TabsTrigger value="accounting" disabled={!safeProject.profile.acctEnabled}>Accounting Attributes</TabsTrigger>
                                    <TabsTrigger value="vendor">Vendor-Specific</TabsTrigger>
                                </TabsList>
                                <TabsContent value="check">
                                    <AttributeEditor 
                                        attributes={safeProject.profile.checkAttributes} 
                                        type="checkAttributes"
                                        onToggle={handleAttributeToggle}
                                        onRemove={removeAttribute}
                                        isDisabled={!safeProject.profile.authEnabled}
                                    />
                                </TabsContent>
                                <TabsContent value="reply">
                                    <AttributeEditor 
                                        attributes={safeProject.profile.replyAttributes}
                                        type="replyAttributes"
                                        onToggle={handleAttributeToggle}
                                        onRemove={removeAttribute}
                                        isDisabled={!safeProject.profile.authEnabled}
                                    />
                                </TabsContent>
                                <TabsContent value="vendor">
                                    <AttributeEditor 
                                        attributes={safeProject.profile.vendorAttributes}
                                        type="vendorAttributes"
                                        onToggle={handleAttributeToggle}
                                        onRemove={removeAttribute}
                                    />
                                </TabsContent>
                                <TabsContent value="accounting">
                                    <AttributeEditor 
                                        attributes={safeProject.profile.accountingAttributes}
                                        type="accountingAttributes"
                                        onToggle={handleAttributeToggle}
                                        onRemove={removeAttribute}
                                        isDisabled={!safeProject.profile.acctEnabled}
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
             <div className="flex justify-center items-center gap-4 py-6">
                <Button 
                    size="lg" 
                    onClick={handlePreviewClick}
                    className={cn(showPreviewHint && "animate-pulse")}
                    disabled={!project.name.trim() || !safeProject.sharedSecret.trim() || safeProject.subscriberGroups.length === 0}
                >
                    <Eye className="mr-2"/>
                    Preview
                </Button>
                <Dialog open={isCliTestOpen} onOpenChange={setIsCliTestOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            size="lg" 
                            variant="outline"
                        >
                            <FlaskConical className="mr-2"/>
                            Test with your real device
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Real Device Test</DialogTitle>
                            <DialogDescription>
                                Configure your device to send RADIUS packets to the Monyfi controller.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-green-400 min-h-[300px]">
                           <p className="flex items-center gap-2">
                                <Terminal className="size-4" />
                                <span>Send packets from your device...</span>
                            </p>
                            <p className="flex items-center gap-2 mt-2">
                                <Loader className="size-4 animate-spin" />
                                <span>Waiting for connection...</span>
                           </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCliTestOpen(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <PreviewAnimation open={isPreviewOpen} onOpenChange={setIsPreviewOpen} profile={safeProject.profile} />
        </div>
    );
}

function AttributeEditor({ attributes, type, onToggle, onRemove, isDisabled }: { attributes: string[], type: ProfileAttributeType, onToggle: (type: ProfileAttributeType, attr: string) => void, onRemove: (type: ProfileAttributeType, attr: string) => void, isDisabled?: boolean }) {
    return (
        <Card className={isDisabled ? 'bg-muted/30' : ''}>
            <CardContent className="pt-6">
                <div className="flex justify-end mb-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={isDisabled}>
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
                            <button onClick={() => onRemove(type, attr)} disabled={isDisabled} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5">
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

// Main Page Component
export default function ProjectsPage() {
    const { projects, groups, addProject: addProjectToContext, updateProject: updateProjectInContext, deleteProject: deleteProjectFromContext, isOrgDataLoaded } = useOrganization();
    const { user } = useAuth();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isBlinking, setIsBlinking] = useState(false);

     useEffect(() => {
        if (user) {
            const onboardingStatus = localStorage.getItem(`onboarding_complete_project_${user.name}`);
            if (onboardingStatus === 'false') {
                setIsBlinking(true);
            }
        }
    }, [user]);

    const handleSelectProject = (project: Project) => {
        setSelectedProject(project);
        if (user) {
            const onboardingStatus = localStorage.getItem(`onboarding_complete_project_${user.name}`);
            if (onboardingStatus === 'false') {
                localStorage.setItem(`onboarding_show_preview_hint_${user.name}`, 'true');
                localStorage.setItem(`onboarding_complete_project_${user.name}`, 'true');
            }
            setIsBlinking(false);
        }
    };
    
    const handleBack = () => {
        setSelectedProject(null);
    }

    const addProject = async () => {
        const newProjectData: Partial<Project> = {
            name: 'New Project',
            description: 'A new project ready for configuration.',
            status: 'Draft',
            sharedSecret: '',
            subscriberGroups: [],
            profile: {
                authEnabled: true,
                acctEnabled: false,
                checkAttributes: [],
                replyAttributes: [],
                vendorAttributes: [],
                accountingAttributes: [],
            }
        };
        const newProject = await addProjectToContext(newProjectData);
        if (newProject) {
            setSelectedProject(newProject);
        }
    };
    
    const updateProject = (updatedProject: Project) => {
        setSelectedProject(updatedProject);
        // This is an unsaved change in the editor. The actual save happens in `saveProject`.
    };

    const saveProject = async () => {
        if (!selectedProject) return;
        await updateProjectInContext(selectedProject);
    };

    const deleteProject = async () => {
        if (!selectedProject) return;
        await deleteProjectFromContext(selectedProject.id);
        setSelectedProject(null);
    };
    
    const duplicateProject = async () => {
        if (!selectedProject) return;
        const newProjectData: Partial<Project> = {
            ...JSON.parse(JSON.stringify(selectedProject)),
            name: `${selectedProject.name} (Copy)`,
            status: 'Draft',
        };
        const newProject = await addProjectToContext(newProjectData);
        if (newProject) {
            setSelectedProject(newProject);
        }
    };

    if (selectedProject) {
        return (
             <ProjectEditor 
                project={selectedProject}
                onUpdate={updateProject}
                onSave={saveProject}
                onDelete={deleteProject}
                onDuplicate={duplicateProject}
                onBack={handleBack}
                subscriberGroups={groups.map(g => g.name)}
            />
        )
    }
    
    if (!isOrgDataLoaded && projects.length === 0) {
        return (
             <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <Card className="w-full max-w-lg text-center glass-card">
                    <CardHeader>
                         <div className="mx-auto mb-4 flex items-center justify-center size-16 bg-muted/50 rounded-full border-primary/20 animate-pulse">
                           <FolderKanban className="size-8 text-primary/50" />
                        </div>
                        <CardTitle>Loading Projects...</CardTitle>
                        <CardDescription>Please wait while we fetch your projects.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (isOrgDataLoaded && projects.length === 0) {
        return (
             <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <Card className="w-full max-w-lg text-center glass-card">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex items-center justify-center size-16 bg-primary/10 rounded-full border border-primary/20">
                           <FolderKanban className="size-8 text-primary" />
                        </div>
                        <CardTitle>No projects yet</CardTitle>
                        <CardDescription>Start building your AAA system by creating a project.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={addProject}><PlusCircle className="mr-2" /> Add Project</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card className="glass-card">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Projects</CardTitle>
                            <CardDescription>Manage your RADIUS projects and profiles.</CardDescription>
                        </div>
                        <Button onClick={addProject}><PlusCircle className="mr-2"/> Add Project</Button>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {projects.map(project => (
                        <Card key={project.id} className={cn("cursor-pointer hover:border-primary", isBlinking && "animate-pulse border-primary ring-2 ring-primary")} onClick={() => handleSelectProject(project)}>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>{project.name}</span>
                                    <Badge variant={project.auth_enabled ? 'default' : 'secondary'}>
                                        {project.auth_enabled ? 'Auth Enabled' : 'Auth Disabled'}
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="truncate">{project.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Created: {project.createdAt}</p>
                                <div className="mt-2">
                                    {(project.subscriberGroups || []).slice(0,3).map((g: string) => <Badge key={g} variant="outline" className="mr-1">{g}</Badge>)}
                                    {(project.subscriberGroups || []).length > 3 && <Badge variant="outline">...</Badge>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

    

    








