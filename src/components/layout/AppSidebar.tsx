
'use client';

import { usePathname } from 'next/navigation';
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
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Waypoints,
  Settings,
  Users,
  Database,
  Users2,
  CreditCard,
  FlaskConical,
  Building2,
  FileText,
  Share2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import logo from '@/components/icons/logo.png';

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
  { href: '/organizations', label: 'Organizations', icon: Building2 },
];

const configureItems = [
    { href: '/database', label: 'Database', icon: Database },
    { href: '/workflows', label: 'Workflow Designer', icon: Waypoints },
    { href: '/profiles', label: 'Profiles', icon: FileText },
    { href: '/testing', label: 'Testing', icon: FlaskConical },
    { href: '/configuration', label: 'Configuration', icon: Share2 }
];

const adminItems = [
    { href: '/billing', label: 'Billing', icon: CreditCard },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

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
      <SidebarContent>
        <SidebarMenu>
            <SidebarGroup>
                <SidebarGroupLabel>Manage</SidebarGroupLabel>
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
            <Separator />
            <SidebarGroup>
                <SidebarGroupLabel>Configure</SidebarGroupLabel>
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
            <Separator />
             <SidebarGroup>
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
            </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-2" />
        <Button variant="outline" className="w-full justify-center">
          <Share2 className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden ml-2">Share Feedback</span>
        </Button>
      </SidebarFooter>
    </>
  );
}
