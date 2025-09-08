
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
import { useAsgardeo } from '@asgardeo/nextjs';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function SubscribersPage() {
    const { 
        subscribers, 
        products, 
        groups, 
        profiles,
        setSubscribers, 
        setProducts, 
        setGroups
    } = useOrganization();
    const { user } = useAsgardeo();
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [showGroupsHint, setShowGroupsHint] = useState(false);
    const [showProjectButton, setShowProjectButton] = useState(false);

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
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add New Subscriber</DialogTitle>
                                                <DialogDescription>Enter the details for the new subscriber.</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="s-username" className="text-right">Username</Label>
                                                    <Input id="s-username" className="col-span-3" />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="s-fullname" className="text-right">Full Name</Label>
                                                    <Input id="s-fullname" className="col-span-3" />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="s-password" className="text-right">Password</Label>
                                                    <Input id="s-password" type="password" className="col-span-3" />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="s-product" className="text-right">Product</Label>
                                                    <Select>
                                                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a product" /></SelectTrigger>
                                                        <SelectContent>
                                                            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="s-group" className="text-right">Group</Label>
                                                    <Select>
                                                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a group" /></SelectTrigger>
                                                        <SelectContent>
                                                            {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit">Save Subscriber</Button>
                                            </DialogFooter>
                                        </DialogContent>
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
                                        {subscribers.map((subscriber) => (
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
                                                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2" /> Delete</DropdownMenuItem>
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
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Product</DialogTitle>
                                            <DialogDescription>Define a new subscriber plan or product.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="p-name" className="text-right">Name</Label>
                                                <Input id="p-name" placeholder="e.g. Premium" className="col-span-3" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="p-bw-up" className="text-right">Bandwidth Up</Label>
                                                <Input id="p-bw-up" placeholder="e.g. 50 Mbps" className="col-span-3" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="p-bw-down" className="text-right">Bandwidth Down</Label>
                                                <Input id="p-bw-down" placeholder="e.g. 250 Mbps" className="col-span-3" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="p-session" className="text-right">Session Limit</Label>
                                                <Input id="p-session" placeholder="e.g. 72h" className="col-span-3" />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit">Save Product</Button>
                                        </DialogFooter>
                                    </DialogContent>
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
                                    {products.map(product => (
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
                                                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2" /> Delete</DropdownMenuItem>
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
                                    <CardDescription>Organize subscribers into groups for policy management.</CardDescription>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button><PlusCircle className="mr-2" /> Add Group</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Group</DialogTitle>
                                            <DialogDescription>Create a new group to organize subscribers.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="g-name" className="text-right">Name</Label>
                                                <Input id="g-name" placeholder="e.g. Enterprise" className="col-span-3" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="g-desc" className="text-right">Description</Label>
                                                <Input id="g-desc" placeholder="e.g. Corporate users" className="col-span-3" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="g-profile" className="text-right">RADIUS Profile</Label>
                                                <Select>
                                                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a profile" /></SelectTrigger>
                                                    <SelectContent>
                                                        {profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit">Save Group</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Group Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>RADIUS Profile</TableHead>
                                        <TableHead>Subscribers</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {groups.map(group => (
                                        <TableRow key={group.id}>
                                            <TableCell className="font-medium">{group.name}</TableCell>
                                            <TableCell>{group.description}</TableCell>
                                            <TableCell><Badge variant="outline">{group.profile}</Badge></TableCell>
                                            <TableCell>{group.subscribers}</TableCell>
                                            <TableCell className="text-right">
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem><Pencil className="mr-2" /> Edit</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2" /> Delete</DropdownMenuItem>
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
        </div>
    );
}

    