
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Trash2, Upload, Eye, EyeOff, PlusCircle, Search, MoreHorizontal, Pencil, SlidersHorizontal, Users2, Package, FolderKanban, ArrowRight } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganization, type Subscriber, type Product, type Group } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function SubscribersPage() {
    const { 
        subscribers, 
        products, 
        groups, 
        profiles,
        addSubscriber,
        // updateSubscriber,
        deleteSubscriber,
        addProduct,
        deleteProduct,
        addGroup,
        updateGroup,
        deleteGroup,
        isOrgDataLoaded,
        getProjectsForGroup,
        getSubscriberCountForGroup
    } = useOrganization();
    const { user } = useAuth();
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [showGroupsHint, setShowGroupsHint] = useState(false);
    const [showProjectButton, setShowProjectButton] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

     useEffect(() => {
        if (user) {
            const hintEnabled = localStorage.getItem(`onboarding_show_groups_hint_${user.name}`) === 'true';
            setShowGroupsHint(hintEnabled);

            const projectButtonEnabled = localStorage.getItem(`onboarding_show_project_button_${user.name}`) === 'true';
            setShowProjectButton(projectButtonEnabled);
        }
    }, [user]);


    const handleFileSelect = (file: File) => {
        console.log("New file selected:", file.name);
        alert(`File "${file.name}" ready for upload. Data will be replaced upon confirmation.`);
    };

    const handleDeleteAndReupload = () => {
        fileInputRef.current?.click();
    };

    const downloadCsv = () => {
        if (subscribers.length === 0) return;
        const headers = Object.keys(subscribers[0]).filter(h => h !== 'pass');
        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...subscribers.map(row => headers.map(h => (row as any)[h]).join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "subscribers.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleTabChange = (value: string) => {
        if (value === 'groups' && showGroupsHint && user) {
            localStorage.removeItem(`onboarding_show_groups_hint_${user.name}`);
            localStorage.setItem(`onboarding_show_project_button_${user.name}`, 'true');
            setShowGroupsHint(false);
            setShowProjectButton(true);
        }
    };

    const handleTryProjectClick = () => {
        if (user) {
            localStorage.removeItem(`onboarding_show_project_button_${user.name}`);
            localStorage.setItem(`onboarding_complete_project_${user.name}`, 'false');
        }
        setShowProjectButton(false);
        router.push('/projects');
    };

    const handleEditGroup = (group: Group) => {
        setEditingGroup(group);
        setIsEditGroupModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditingGroup(null);
        setIsEditGroupModalOpen(false);
    };

    return (
        <div className="mx-auto max-w-7xl space-y-8">
            <Tabs defaultValue="subscribers" onValueChange={handleTabChange}>
                <TabsList className="max-w-lg">
                    <TabsTrigger value="subscribers">
                        <Users2 className="mr-2" /> Subscribers
                    </TabsTrigger>
                    <TabsTrigger value="products">
                        <Package className="mr-2" /> Products
                    </TabsTrigger>
                     <TabsTrigger value="groups" className={cn(showGroupsHint && "animate-pulse ring-2 ring-primary ring-offset-2 ring-offset-background")}>
                        <FolderKanban className="mr-2" /> Groups
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="subscribers">
                    <Card className="glass-card">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Subscriber Management</CardTitle>
                                    <CardDescription>View, manage, and import your user data.</CardDescription>
                                </div>
                                <div className="flex w-full sm:w-auto gap-2">
                                     <div className="relative flex-1 sm:flex-auto">
                                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                                       <Input placeholder="Search subscribers..." className="pl-10"/>
                                    </div>
                                    <Button variant="outline"><SlidersHorizontal className="mr-2" /> Filter</Button>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button><PlusCircle className="mr-2" /> Add Subscriber</Button>
                                        </DialogTrigger>
                                        <AddSubscriberDialog />
                                    </Dialog>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                             <div className="flex justify-end items-center mb-2 px-4">
                                 <Button variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff className="mr-2" /> : <Eye className="mr-2" />}
                                    {showPassword ? 'Hide' : 'Show'} Passwords
                                </Button>
                            </div>
                            <div className="overflow-x-auto rounded-t-lg border-t">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Password</TableHead>
                                            <TableHead>Full Name</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Group</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {!isOrgDataLoaded ? (
                                            [...Array(5)].map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell colSpan={7} className="p-0">
                                                        <div className="w-full h-12 bg-muted/50 animate-pulse" />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : subscribers.map((subscriber) => (
                                            <TableRow key={subscriber.id}>
                                                <TableCell className="font-medium">{subscriber.username}</TableCell>
                                                <TableCell>{showPassword ? subscriber.pass : '********'}</TableCell>
                                                <TableCell>{subscriber.fullname}</TableCell>
                                                <TableCell><Badge variant="outline">{subscriber.product}</Badge></TableCell>
                                                <TableCell>{subscriber.group}</TableCell>
                                                <TableCell>
                                                    <Badge variant={subscriber.status === 'Online' ? 'default' : 'secondary'} className={subscriber.status === 'Online' ? "bg-green-600/20 text-green-300 border-green-500/30" : ""}>
                                                        {subscriber.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem><Pencil className="mr-2" /> Edit</DropdownMenuItem>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive"><Trash2 className="mr-2" /> Delete</DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This will permanently delete the subscriber "{subscriber.username}".
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => deleteSubscriber(subscriber.id)}>Delete</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                            <p className="text-sm text-muted-foreground text-center sm:text-left">
                                A total of {subscribers.length} subscribers are in the system.
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={downloadCsv}>
                                    <Download className="mr-2" />
                                    Download CSV
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="secondary">
                                            <Upload className="mr-2" />
                                            Bulk Upload
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Bulk Upload / Replace Data</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete all current subscriber data and replace it with the data from your new CSV file. You can download the current data first as a backup.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteAndReupload}>
                                                Delete and Re-upload
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".csv"
                                    onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]) }}
                                />
                            </div>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="products">
                     <Card className="glass-card">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Products</CardTitle>
                                    <CardDescription>Manage subscriber plans and their associated RADIUS attributes.</CardDescription>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button><PlusCircle className="mr-2" /> Add Product</Button>
                                    </DialogTrigger>
                                    <AddProductDialog />
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Bandwidth Up</TableHead>
                                        <TableHead>Bandwidth Down</TableHead>
                                        <TableHead>Session Limit</TableHead>
                                        <TableHead>Subscribers</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!isOrgDataLoaded ? (
                                        [...Array(3)].map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={6} className="p-0">
                                                    <div className="w-full h-12 bg-muted/50 animate-pulse" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : products.map(product => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>{product.bandwidthUp}</TableCell>
                                            <TableCell>{product.bandwidthDown}</TableCell>
                                            <TableCell>{product.sessionLimit}</TableCell>
                                            <TableCell>{product.subscribers}</TableCell>
                                            <TableCell className="text-right">
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem><Pencil className="mr-2" /> Edit</DropdownMenuItem>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive"><Trash2 className="mr-2" /> Delete</DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will permanently delete the product "{product.name}".
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => deleteProduct(product.id)}>Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                     </Card>
                </TabsContent>
                <TabsContent value="groups">
                     <Card className="glass-card">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Groups</CardTitle>
                                    <CardDescription>Organize subscribers into groups. Assign groups to projects to apply authentication policies.</CardDescription>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button><PlusCircle className="mr-2" /> Add Group</Button>
                                    </DialogTrigger>
                                    <AddGroupDialog />
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Group Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Projects</TableHead>
                                        <TableHead>Subscribers</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!isOrgDataLoaded ? (
                                        [...Array(3)].map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={5} className="p-0">
                                                    <div className="w-full h-12 bg-muted/50 animate-pulse" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : groups.map(group => (
                                        <TableRow key={group.id}>
                                            <TableCell className="font-medium">{group.name}</TableCell>
                                            <TableCell>{group.description}</TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const groupProjects = getProjectsForGroup(group.name);
                                                    return groupProjects.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {groupProjects.map(project => (
                                                                <Badge key={project.id} variant="outline" className="text-xs">
                                                                    {project.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">No projects</span>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell>{getSubscriberCountForGroup(group.id)}</TableCell>
                                            <TableCell className="text-right">
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => handleEditGroup(group)}><Pencil className="mr-2" /> Edit</DropdownMenuItem>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive"><Trash2 className="mr-2" /> Delete</DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will permanently delete the group "{group.name}".
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => deleteGroup(group.id)}>Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                         {showProjectButton && (
                            <CardFooter className="pt-6 justify-center">
                                <Button size="lg" className="animate-pulse" onClick={handleTryProjectClick}>
                                    Try out your first AAA project
                                    <ArrowRight className="ml-2"/>
                                </Button>
                            </CardFooter>
                        )}
                     </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Group Modal */}
            {editingGroup && (
                <EditGroupDialog 
                    group={editingGroup} 
                    isOpen={isEditGroupModalOpen} 
                    onClose={handleCloseEditModal} 
                    onUpdate={updateGroup}
                />
            )}
        </div>
    );
}

function AddGroupDialog() {
    const { addGroup } = useOrganization();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async () => {
        const groupData = {
            name,
            description,
        };
        await addGroup(groupData);
        setIsOpen(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Group</DialogTitle>
                <DialogDescription>Create a new group to organize subscribers. Groups can be assigned to projects for authentication policies.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="g-name" className="text-right">Name</Label>
                    <Input id="g-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Enterprise" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="g-desc" className="text-right">Description</Label>
                    <Input id="g-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Corporate users" className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit}>Save Group</Button>
            </DialogFooter>
        </DialogContent>
    );
}

function EditGroupDialog({ group, isOpen, onClose, onUpdate }: { group: Group, isOpen: boolean, onClose: () => void, onUpdate: (group: Group) => Promise<Group | null> }) {
    const [name, setName] = useState(group.name);
    const [description, setDescription] = useState(group.description);
    const [isUpdating, setIsUpdating] = useState(false);

    // Reset form when group changes
    useEffect(() => {
        setName(group.name);
        setDescription(group.description);
    }, [group]);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        
        setIsUpdating(true);
        try {
            const updatedGroup = {
                ...group,
                name: name.trim(),
                description: description.trim(),
            };
            await onUpdate(updatedGroup);
            onClose();
        } catch (error) {
            console.error('Failed to update group:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = () => {
        setName(group.name);
        setDescription(group.description);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Group</DialogTitle>
                    <DialogDescription>Update the group name and description.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-g-name" className="text-right">Name</Label>
                        <Input 
                            id="edit-g-name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="e.g. Enterprise" 
                            className="col-span-3" 
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-g-desc" className="text-right">Description</Label>
                        <Input 
                            id="edit-g-desc" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="e.g. Corporate users" 
                            className="col-span-3" 
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isUpdating || !name.trim()}>
                        {isUpdating ? 'Updating...' : 'Update Group'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AddProductDialog() {
    const { addProduct } = useOrganization();
    const [name, setName] = useState('');
    const [bandwidthUp, setBandwidthUp] = useState('');
    const [bandwidthDown, setBandwidthDown] = useState('');
    const [sessionLimit, setSessionLimit] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async () => {
        const productData = {
            name,
            bandwidthUp,
            bandwidthDown,
            sessionLimit,
        };
        await addProduct(productData);
        setIsOpen(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Define a new subscriber plan or product.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="p-name" className="text-right">Name</Label>
                    <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Premium" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="p-bw-up" className="text-right">Bandwidth Up</Label>
                    <Input id="p-bw-up" value={bandwidthUp} onChange={(e) => setBandwidthUp(e.target.value)} placeholder="e.g. 50 Mbps" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="p-bw-down" className="text-right">Bandwidth Down</Label>
                    <Input id="p-bw-down" value={bandwidthDown} onChange={(e) => setBandwidthDown(e.target.value)} placeholder="e.g. 250 Mbps" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="p-session" className="text-right">Session Limit</Label>
                    <Input id="p-session" value={sessionLimit} onChange={(e) => setSessionLimit(e.target.value)} placeholder="e.g. 72h" className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit}>Save Product</Button>
            </DialogFooter>
        </DialogContent>
    );
}

function AddSubscriberDialog() {
    const { addSubscriber, products, groups } = useOrganization();
    const [username, setUsername] = useState('');
    const [fullname, setFullname] = useState('');
    const [password, setPassword] = useState('');
    const [productId, setProductId] = useState('');
    const [groupId, setGroupId] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async () => {
        const subscriberData = {
            username,
            fullname,
            pass: password,
            product_id: parseInt(productId),
            group_id: parseInt(groupId),
        };
        await addSubscriber(subscriberData);
        setIsOpen(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Subscriber</DialogTitle>
                <DialogDescription>Enter the details for the new subscriber.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="s-username" className="text-right">Username</Label>
                    <Input id="s-username" value={username} onChange={(e) => setUsername(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="s-fullname" className="text-right">Full Name</Label>
                    <Input id="s-fullname" value={fullname} onChange={(e) => setFullname(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="s-password" className="text-right">Password</Label>
                    <Input id="s-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="s-product" className="text-right">Product</Label>
                    <Select onValueChange={setProductId}>
                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a product" /></SelectTrigger>
                        <SelectContent>
                            {products.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="s-group" className="text-right">Group</Label>
                    <Select onValueChange={setGroupId}>
                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a group" /></SelectTrigger>
                        <SelectContent>
                            {groups.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit}>Save Subscriber</Button>
            </DialogFooter>
        </DialogContent>
    );
}

    