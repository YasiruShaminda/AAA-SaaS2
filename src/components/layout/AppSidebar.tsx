
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarSeparator
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Waypoints,
  Settings,
  Users,
  Users2,
  CreditCard,
  FlaskConical,
  FolderKanban,
  Share2,
  ChevronsUpDown,
  PlusCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import logo from '@/components/icons/logo.png';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { Organization } from '@/contexts/OrganizationContext';

const Logo = () => (
    <div className="flex items-center justify-center size-10 rounded-lg">
        <Image 
            src={logo}
            alt="Logo"
            width={32}
            height={32}
        />
    </div>
);

const manageItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sessions', label: 'Active Sessions', icon: Users },
  { href: '/subscribers', label: 'Subscribers', icon: Users2 },
];

const configureItems = [
    { href: '/projects', label: 'Projects', icon: FolderKanban },
    { href: '/testing', label: 'Testing', icon: FlaskConical },
];

const adminItems = [
    { href: '/subscription', label: 'Subscription', icon: CreditCard },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedOrganization, organizations, selectOrganization, addOrganization } = useOrganization();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDesc, setNewOrgDesc] = useState('');

  const handleOrgSelect = (org: (typeof organizations)[0]) => {
    selectOrganization(org, () => {
        router.push('/');
        setPopoverOpen(false);
    });
  }

  const handleAddNewOrg = () => {
    if (!newOrgName.trim()) return;
    const newOrg: Organization = {
        id: `org-${Date.now()}`,
        name: newOrgName,
        description: newOrgDesc,
        type: 'Client',
        subscribers: 0,
        status: 'Trial',
    };
    addOrganization(newOrg);
    setNewOrgName('');
    setNewOrgDesc('');
    setIsAddModalOpen(false);
    setPopoverOpen(false);
  }

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
            <Logo />
            <h1 className="font-headline text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden">
            Monyfi SaaS
            </h1>
        </div>
      </SidebarHeader>

      <SidebarGroup>
         <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <button className="w-full text-left p-2 rounded-lg hover:bg-muted/50 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:aspect-square group-data-[collapsible=icon]:justify-center flex items-center justify-between h-16 border">
                     <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10 border border-primary/20">
                            <Waypoints className="size-5 text-primary" />
                        </div>
                        <div className="group-data-[collapsible=icon]:hidden">
                            <p className="text-xs text-muted-foreground">Organization</p>
                            <p className="font-semibold truncate">
                                {selectedOrganization ? selectedOrganization.name : "Select..."}
                            </p>
                        </div>
                    </div>
                    <ChevronsUpDown className="size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" side="right" align="start">
                <ScrollArea className="h-72">
                     <div className="p-2 space-y-1">
                        <p className="p-2 text-xs font-semibold text-muted-foreground">Switch organization</p>
                        {organizations.map(org => (
                            <Button
                                key={org.id}
                                variant={selectedOrganization?.id === org.id ? 'secondary' : 'ghost'}
                                className="w-full justify-start font-normal"
                                onClick={() => handleOrgSelect(org)}
                            >
                               {org.name}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
                <SidebarSeparator />
                <div className="p-2">
                    <Button className="w-full" size="sm" onClick={() => { setIsAddModalOpen(true); }}>
                        <PlusCircle className="mr-2"/>
                        Add Organization
                    </Button>
                </div>
            </PopoverContent>
         </Popover>
      </SidebarGroup>
      
      <SidebarSeparator className="my-2" />

      <SidebarContent>
        {selectedOrganization && (
            <SidebarMenu>
                <SidebarGroup>
                    {manageItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === item.href}
                            tooltip={{ children: item.label, side: 'right' }}
                        >
                            <Link href={item.href}>
                            <item.icon />
                            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarGroup>
                <SidebarSeparator />
                <SidebarGroup>
                     {configureItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === item.href}
                            tooltip={{ children: item.label, side: 'right' }}
                        >
                            <Link href={item.href}>
                            <item.icon />
                            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarGroup>
            </SidebarMenu>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            {adminItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side: 'right' }}
                >
                    <Link href={item.href}>
                    <item.icon />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            <SidebarSeparator />
            <Button variant="outline" className="w-full justify-center">
                <Share2 className="size-4" />
                <span className="group-data-[collapsible=icon]:hidden ml-2">Share Feedback</span>
            </Button>
        </SidebarMenu>
      </SidebarFooter>

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
    </>
  );
}
