
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useOrganization } from '@/contexts/OrganizationContext';
import logo from '@/components/icons/logo.png';
import Link from 'next/link';
import { useAsgardeo } from '@asgardeo/nextjs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User as UserIcon, LogOut } from 'lucide-react';

const pageTitles: { [key: string]: string } = {
  '/': 'Dashboard',
  '/workflows': 'Workflow Designer',
  '/vendors': 'Vendor Profiles',
  '/sessions': 'Active Sessions',
  '/subscribers': 'Subscribers',
  '/clients': 'Client Management',
  '/database': 'Database Management',
  '/subscription': 'Subscription',
  '/testing': 'Workflow Tester',
  '/projects': 'Projects',
  '/settings': 'Settings',
  '/organizations': 'Organizations',
  '/organizations/new': 'Create Organization',
  '/profile': 'User Profile',
};

export function AppHeader() {
  const pathname = usePathname();
  const { selectedOrganization } = useOrganization();
  const title = pageTitles[pathname] || 'Monyfi SaaS';
  const { user, signOut } = useAsgardeo();

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="hidden md:flex" />
        <div className="flex items-center gap-2 md:hidden">
            <Image 
                src={logo}
                alt="Logo"
                width={32}
                height={32}
            />
            <span className="font-headline text-lg font-semibold">Monify SaaS</span>
        </div>
        <h1 className="hidden text-xl font-semibold font-headline md:block">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src={user?.profileUrl} alt="User Profile Picture" />
              <AvatarFallback>
                  <UserIcon className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{user?.displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2" />
                Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
