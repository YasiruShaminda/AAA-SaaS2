
'use client';

import { useState, Fragment } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PlusCircle, MoreHorizontal, Pencil, Trash2, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

type Organization = {
    id: string;
    name: string;
    type: 'Region' | 'Site' | 'Client';
    subscribers: number;
    systems: number;
    vendor: string;
    children?: Organization[];
};

const sampleOrganizations: Organization[] = [
    {
        id: 'org-1',
        name: 'Global Corp',
        type: 'Region',
        subscribers: 1500,
        systems: 25,
        vendor: 'Cisco',
        children: [
            {
                id: 'org-1-1',
                name: 'North America',
                type: 'Region',
                subscribers: 800,
                systems: 15,
                vendor: 'Cisco',
                children: [
                    { id: 'org-1-1-1', name: 'East Coast Office', type: 'Site', subscribers: 500, systems: 10, vendor: 'Ruckus' },
                    { id: 'org-1-1-2', name: 'West Coast Office', type: 'Site', subscribers: 300, systems: 5, vendor: 'Cisco' },
                ],
            },
            {
                id: 'org-1-2',
                name: 'Europe',
                type: 'Region',
                subscribers: 700,
                systems: 10,
                vendor: 'Actiontec',
            },
        ],
    },
    {
        id: 'org-2',
        name: 'FTTX Provider',
        type: 'Client',
        subscribers: 10000,
        systems: 50,
        vendor: 'Multiple',
    },
];

const OrganizationRow = ({ org, level = 0 }: { org: Organization, level?: number }) => {
    const [isOpen, setIsOpen] = useState(level < 1);
    const hasChildren = org.children && org.children.length > 0;

    return (
        <Fragment>
            <TableRow className="hover:bg-muted/50">
                <TableCell style={{ paddingLeft: `${level * 1.5 + 1}rem` }}>
                     <Collapsible asChild>
                        <div className="flex items-center gap-2">
                            {hasChildren && (
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(!isOpen)}>
                                        <ChevronRight className={cn("transition-transform duration-200", isOpen && "rotate-90")} />
                                    </Button>
                                </CollapsibleTrigger>
                            )}
                             <span className={cn("font-medium", !hasChildren && "ml-9")}>{org.name}</span>
                        </div>
                     </Collapsible>
                </TableCell>
                <TableCell><Badge variant="outline">{org.type}</Badge></TableCell>
                <TableCell>{org.subscribers.toLocaleString()}</TableCell>
                <TableCell>{org.systems}</TableCell>
                <TableCell>{org.vendor}</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem><Pencil className="mr-2 size-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 size-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
             {hasChildren && isOpen && org.children!.map(childOrg => <OrganizationRow key={childOrg.id} org={childOrg} level={level + 1} />)}
        </Fragment>
    );
};


export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState(sampleOrganizations);

    return (
        <div className="space-y-8">
            <Card className="glass-card">
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Organizations</CardTitle>
                        <CardDescription>Group and manage subscribers hierarchically.</CardDescription>
                    </div>
                    <div className="flex w-full md:w-auto gap-2">
                        <div className="relative flex-1 md:flex-auto">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                           <Input placeholder="Search organizations..." className="pl-10"/>
                        </div>
                        <Button variant="outline"><SlidersHorizontal className="mr-2" /> Filter</Button>
                        <Button><PlusCircle className="mr-2" /> Add Organization</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Subscribers</TableHead>
                                <TableHead>AAA Systems</TableHead>
                                <TableHead>Default Vendor</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {organizations.map(org => (
                                <OrganizationRow key={org.id} org={org} />
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-6">
                     <p className="text-sm text-muted-foreground">
                        Showing {organizations.length} top-level organizations.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
